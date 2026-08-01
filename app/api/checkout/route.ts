import { and, eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb } from "@/db";
import { carts, customers, inventoryMovements, orderItems, orders, paymentTransactions, productVariants } from "@/db/schema";
import { getCartSnapshot } from "@/lib/cart";
import { getBankTransferDetails, getPaymentMethods } from "@/lib/payment-config";
import { createPayPalOrder } from "@/lib/paypal";

type CheckoutBody={firstName?:string;lastName?:string;email?:string;phone?:string;addressLine1?:string;postalCode?:string;city?:string;province?:string;countryCode?:string;customerNote?:string;paymentMethod?:string};
export async function POST(request:Request){
  const token=(await cookies()).get("lcs_cart")?.value;const cart=await getCartSnapshot(token);if(!cart.cartId||!cart.items.length)return Response.json({error:"La borsa è vuota."},{status:400});
  const body=await request.json() as CheckoutBody;const required=[body.firstName,body.lastName,body.email,body.phone,body.addressLine1,body.postalCode,body.city,body.province];if(required.some((v)=>!v?.trim()))return Response.json({error:"Completa tutti i campi obbligatori."},{status:400});
  const methods=await getPaymentMethods();const method=methods.find((m)=>m.code===body.paymentMethod&&m.enabled);if(!method)return Response.json({error:"Metodo di pagamento non disponibile."},{status:400});if(!method.configured)return Response.json({error:"Questo metodo di pagamento non è ancora configurato."},{status:503});
  for(const item of cart.items)if(item.stockQuantity<item.quantity)return Response.json({error:`Giacenza insufficiente per ${item.name}.`},{status:409});
  const db=getDb();const email=body.email!.trim().toLowerCase();let customer=await db.select({id:customers.id}).from(customers).where(eq(customers.email,email)).limit(1);const customerId=customer[0]?.id??crypto.randomUUID();if(customer.length)await db.update(customers).set({firstName:body.firstName!.trim(),lastName:body.lastName!.trim(),phone:body.phone!.trim(),updatedAt:sql`CURRENT_TIMESTAMP`}).where(eq(customers.id,customerId));else await db.insert(customers).values({id:customerId,email,firstName:body.firstName!.trim(),lastName:body.lastName!.trim(),phone:body.phone!.trim()});
  const orderId=crypto.randomUUID();const orderNumber=`LCS-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0,4).toUpperCase()}`;const address={recipientName:`${body.firstName} ${body.lastName}`,addressLine1:body.addressLine1,postalCode:body.postalCode,city:body.city,province:body.province,countryCode:(body.countryCode||"IT").toUpperCase()};
  await db.insert(orders).values({id:orderId,orderNumber,customerId,cartId:cart.cartId,email,phone:body.phone!.trim(),subtotalCents:cart.subtotalCents,totalCents:cart.subtotalCents,currency:cart.currency,paymentMethodCode:method.code,shippingAddressJson:JSON.stringify(address),billingAddressJson:JSON.stringify(address),customerNote:body.customerNote?.trim()||null});
  for(const item of cart.items)await db.insert(orderItems).values({id:crypto.randomUUID(),orderId,productId:item.productId,variantId:item.variantId,productName:item.name,variantName:item.variantName,sku:item.sku,quantity:item.quantity,unitPriceCents:item.unitPriceCents,totalCents:item.lineTotalCents});
  const transactionId=crypto.randomUUID();await db.insert(paymentTransactions).values({id:transactionId,orderId,paymentMethodCode:method.code,type:method.code==="paypal"?"authorization":"instruction",amountCents:cart.subtotalCents,currency:cart.currency});
  let redirectUrl=`/ordine/${encodeURIComponent(orderNumber)}`;
  if(method.code==="paypal"){
    try{const origin=new URL(request.url).origin;const paypal=await createPayPalOrder({reference:orderId,amountCents:cart.subtotalCents,currency:cart.currency,returnUrl:`${origin}/checkout/paypal/complete?order=${encodeURIComponent(orderNumber)}`,cancelUrl:`${origin}/checkout?cancelled=1`});if(!paypal.approveUrl)throw new Error("Link PayPal mancante");await db.update(paymentTransactions).set({providerReference:paypal.id,responseJson:JSON.stringify(paypal.raw)}).where(eq(paymentTransactions.id,transactionId));redirectUrl=paypal.approveUrl;}catch{await db.update(paymentTransactions).set({status:"failed"}).where(eq(paymentTransactions.id,transactionId));return Response.json({error:"PayPal non è al momento disponibile. Riprova più tardi."},{status:502});}
  }
  for(const item of cart.items){await db.update(productVariants).set({stockQuantity:sql`${productVariants.stockQuantity} - ${item.quantity}`,updatedAt:sql`CURRENT_TIMESTAMP`}).where(and(eq(productVariants.id,item.variantId),sql`${productVariants.stockQuantity} >= ${item.quantity}`));await db.insert(inventoryMovements).values({id:crypto.randomUUID(),variantId:item.variantId,quantityDelta:-item.quantity,reason:"sale",referenceType:"order",referenceId:orderId});}
  await db.update(carts).set({status:"converted",updatedAt:sql`CURRENT_TIMESTAMP`}).where(eq(carts.id,cart.cartId));
  if(method.code==="bank_transfer"){const bank=getBankTransferDetails();await db.update(paymentTransactions).set({responseJson:JSON.stringify({accountHolder:bank.accountHolder,iban:bank.iban,bic:bank.bic})}).where(eq(paymentTransactions.id,transactionId));}
  return Response.json({redirectUrl});
}
