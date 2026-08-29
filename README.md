# OpenBSD Device Support Database

A searchable database of hardware supported by OpenBSD.

The goal of the project is to make it easier to determine whether a device is
supported by OpenBSD using the product names people are likely to encounter
when buying or identifying hardware.

[Live Site](https://obsd-device-support.vercel.app/)

## Why?

The names reported by hardware or used in OpenBSD's device tables do not
necessarily correspond to the product names users encounter when buying
hardware. A device may identify itself with a generic name, and multiple
products may share the same vendor and product IDs.

The OpenBSD Device Support Database connects device information derived from
the OpenBSD source tree with known retail and rebranded product names. This
allows users to search using names they may recognize from packaging,
retailers, or the device itself while retaining the underlying OpenBSD device
and driver information.

## How the Data Is Built

Device support information is derived from the OpenBSD source tree.

An import utility analyzes individual driver source files to extract the
vendor/product symbols used by each driver. OpenBSD drivers do not all express
these relationships in exactly the same way, so the importer preserves
driver-specific parsing rules rather than modifying copies of the source or
manually maintaining the extracted results.

Those symbols are resolved against OpenBSD's `usbdevs` and `pcidevs` data to
obtain hardware identifiers and the device names used by OpenBSD. The importer
then adds the resulting vendor, device, and driver relationships to the
database while checking for existing records to avoid duplicates.

Keeping the parsing rules separate from the source makes the import process
repeatable and maintainable. When an OpenBSD driver adds support for a new
vendor/product ID, the importer can be run again against the updated source.
Existing records are detected and skipped, while newly supported devices are
added to the database.

This is particularly important for an open source project intended to track
another actively developed open source project: the process for deriving the
database is preserved in the repository rather than depending on one-time
manual data entry.

Known retail and rebranded product names are stored separately from the
OpenBSD-derived device records. This preserves the provenance of the OpenBSD
source information while allowing multiple real-world products to be
associated with the same hardware identifiers.

## Search

The website is primarily designed for searching by device name, since that is
the information someone investigating hardware support is most likely to
have.

Search results include the OpenBSD device and driver information along with
hardware identifiers that can be used to verify the exact hardware.

## API

The project exposes an API for looking up devices by bus, vendor ID, and
product ID.

For example:

```text
GET /api/devices/by_bus_vid_pid?bus=USB&vendor_id=0x0bda&product_id=0xf179
```

A successful response includes matching OpenBSD device records and known
alternative product names.

The API is also used by `hwinspect`, a C++ utility that identifies hardware on
a running OpenBSD system and queries the database for additional information.

## hwinspect

[hwinspect](https://github.com/jakemsr/hwinspect) is a companion C++ utility
for inspecting hardware on OpenBSD.

It reads hardware information reported by the local system and uses the
vendor/product identifiers to query this project's API. This keeps the
different sources of device information distinct:

```text
OpenBSD source
      ↓
source parsing and import
      ↓
device support database
      ↓
Next.js API
      ↓
hwinspect
      ↓
hardware detected on a running OpenBSD system
```

The database can then supplement the information reported by the hardware with
the names used in OpenBSD's source and, where known, retail or rebranded
product names.

## Tech Stack

- Next.js
- TypeScript
- PostgreSQL
- Prisma ORM
- Tailwind CSS
- Supabase
- Vercel

The source import utilities are also written in TypeScript and parse OpenBSD C
driver source and device data files to populate the database.

## Status

The project is under active development. Current work includes expanding
device coverage, improving the relationships between OpenBSD device records
and real-world product names, and developing tools that consume the database.

Contributions that improve device coverage or the process for deriving device
information from OpenBSD sources are welcome.
