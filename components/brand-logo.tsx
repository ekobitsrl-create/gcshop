import Image from "next/image";

const BRAND_DOMAINS: Record<string, string> = {
  "alpha studio": "alphastudio.it",
  "amiri": "amiri.com",
  "aquascutum": "aquascutum.com",
  "armani": "armani.com",
  "autry": "autry-usa.com",
  "bagutta": "bagutta.net",
  "baldinini": "baldinini.com",
  "ballantyne": "ballantyne.it",
  "balmain": "balmain.com",
  "bikkembergs": "bikkembergs.com",
  "burberry": "burberry.com",
  "c.p. company": "cpcompany.com",
  "casablanca": "casablancaparis.com",
  "cavalli class": "robertocavalli.com",
  "chloe": "chloe.com",
  "christian louboutin": "christianlouboutin.com",
  "comme des fuckdown": "commedesfuckdown.it",
  "cristina effe": "cristinaeffe.com",
  "d.a.t.e.": "date-sneakers.com",
  "diesel": "diesel.com",
  "diego venturino": "diegoventurino.com",
  "dior": "dior.com",
  "dolce & gabbana": "dolcegabbana.com",
  "dolce and gabbana": "dolcegabbana.com",
  "don the fuller": "donthefuller.com",
  "dsquared2": "dsquared2.com",
  "elisabetta franchi": "elisabettafranchi.com",
  "emporio armani": "armani.com",
  "ermenegildo zegna tessuto": "zegna.com",
  "ferrari": "ferrari.com",
  "givenchy": "givenchy.com",
  "golden goose": "goldengoose.com",
  "gucci": "gucci.com",
  "herno": "herno.com",
  "hinnominate": "hinnominate.com",
  "jacquemus": "jacquemus.com",
  "la martina": "lamartina.com",
  "lanvin": "lanvin.com",
  "loro piana": "loropiana.com",
  "loro piana tessuto": "loropiana.com",
  "love moschino": "moschino.com",
  "maison margiela": "maisonmargiela.com",
  "malo": "malo.it",
  "marni": "marni.com",
  "max mara": "maxmara.com",
  "mc2 saint barth": "mc2saintbarth.com",
  "moose knuckles": "mooseknucklescanada.com",
  "off-white": "off---white.com",
  "palm angels": "palmangels.com",
  "parajumpers": "parajumpers.it",
  "patrizia pepe": "patriziapepe.com",
  "people of shibuya": "peopleofshibuya.com",
  "peuterey": "peuterey.com",
  "pharmacy industry": "pharmacyindustry.it",
  "philipp plein": "plein.com",
  "pinko": "pinko.com",
  "plein sport": "plein.com",
  "pucci": "pucci.com",
  "refrigiwear": "refrigiwear.it",
  "schott nyc": "schottnyc.com",
  "sergio rossi": "sergiorossi.com",
  "suns": "sunsitaly.com",
  "the attico": "theattico.com",
  "the north face": "thenorthface.com",
  "the row": "therow.com",
  "tramarossa": "tramarossa.it",
  "twinset": "twinset.com",
  "valentino garavani": "valentino.com",
  "vilebrequin": "vilebrequin.com",
  "yes zee": "yeszee.it",
  "zegna": "zegna.com",
};

function normalizeBrand(brand: string) {
  return brand
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function brandLogoUrl(brand: string | null | undefined) {
  if (!brand) return null;
  const domain = BRAND_DOMAINS[normalizeBrand(brand)];
  return domain ? `https://logos.hunter.io/${domain}` : null;
}

export function BrandLogo({ brand, className = "" }: { brand: string | null | undefined; className?: string }) {
  const logoUrl = brandLogoUrl(brand);
  const label = brand ?? "LCS Selection";

  if (!logoUrl) return <span className={`brand-wordmark ${className}`.trim()}>{label}</span>;

  return (
    <span className={`brand-logo ${className}`.trim()} title={label}>
      <Image className="brand-logo-image" src={logoUrl} alt={`${label} logo`} width={168} height={42} unoptimized />
    </span>
  );
}
