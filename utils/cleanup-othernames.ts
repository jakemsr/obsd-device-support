import "dotenv/config";
import prisma from "@/lib/prisma";

type MatchingOtherDeviceName = {
  id: bigint;
  device_name: string;
  device_id: bigint;
  vendor_name: string | null;
  source_device_name: string;
  canonical_name: string;
};

async function main() {
  await prisma.$connect();

  const matches = await prisma.$queryRaw<MatchingOtherDeviceName[]>`
    SELECT
      odn.id,
      odn.device_name,
      odn.device_id,
      v.name AS vendor_name,
      d.name AS source_device_name,
      CONCAT_WS(' ', NULLIF(BTRIM(v.name), ''), BTRIM(d.name)) AS canonical_name
    FROM public.other_device_names AS odn
    INNER JOIN public.devices AS d ON d.id = odn.device_id
    INNER JOIN public.vendors AS v ON v.id = d.vendor_id
    WHERE LOWER(BTRIM(odn.device_name)) = LOWER(CONCAT_WS(' ', NULLIF(BTRIM(v.name), ''), BTRIM(d.name)))
    ORDER BY odn.id
  `;

  console.log(`Found ${matches.length} matching other_device_names rows.`);

  console.table(
    matches.map((match) => ({
      ...match,
      id: match.id.toString(),
      device_id: match.device_id.toString(),
    }))
  );


  console.log("Ids of matching other_device_names rows to delete:");
  matches.forEach((match) => {
    console.log(match.id.toString());
  });

  /*
  await prisma.other_device_names.deleteMany({
    where: {
      id: {
        in: matches.map((match) => match.id),
      },
    },
  });
*/
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });