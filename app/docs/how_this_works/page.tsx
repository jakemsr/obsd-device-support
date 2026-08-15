import Link from "next/link";


export default function Page() {
  return (
    <div className="min-h-svh flex flex-col gap-2 p-4">
      <h1 className="text-center text-xl sm:text-2xl md:text-4xl font-bold font-sans">
        How this works
      </h1>
      <h2 className="text-center text-lg sm:text-xl md:text-3xl font-bold font-sans mt-4">
        Searching for devices
      </h2>
      <p>
        The search functionality allows users to search devices based on
        vendor and/or device names. The search results will display a list of devices
        that match the search terms. An empty search field will match all devices
        in the database. Devices are listed in the search results in ascending order
        by device name, then by vendor name, and finally by device ID.
      </p>
      <p>
        Users can filter devices based on bus (connection) and type (functionality).
        The bus and type filters can be used in conjunction with the search field,
        or independently.
        With an empty search field, selecting only a bus will match all devices
        that use that bus. With an empty search field, selecting only a
        type will match all devices that have that type. With an empty search field,
        selecting both a bus and a type will match all devices of that type
        that use that bus.
      </p>
      <p>
        The Quick Search links below the search fields return all
        devices of that type, the same as selecting that type in the search form
        with an empty search field and no bus selected.
      </p>
      <h2 className="text-center text-lg sm:text-xl md:text-3xl font-bold font-sans mt-4">
        Information sources
      </h2>
      <p>
        This database is a collection of information about devices and
        their support in OpenBSD. The database was originally populated
        with data from the OpenBSD source code, specifically the device
        drivers and their associated information.
      </p>
      <p>
        Since the initial population came directly from the source code,
        any device that is listed in this database in a primary role, that
        is, <b>Vendor:/Device:</b>, is assumed to be at least partially
        supported by OpenBSD. More information about OpenBSD driver
        support can be found in the manual pages for the drivers, which
        are linked in the <b>Driver:</b> section.
      </p>
      <p>
        The devices listed in this database in a secondary role, that
        is, <b>Other names:</b>, are taken from sources outside of the
        OpenBSD source code. Currently, the source of this information
        is <Link href="https://wikidevi.wi-cat.ru/" target="_blank" rel="noopener noreferrer" className="text-link hover:underline">wikidevi.wi-cat.ru</Link>.
        These devices are reported to have the same vendor and device IDs
        as the primary device, and as such, the listed driver will also
        match on these devices.
      </p>
      <h2 className="text-center text-lg sm:text-xl md:text-3xl font-bold font-sans mt-4">
        Future plans
      </h2>
      <p>
        The current plan is to add all USB and PCI drivers to the database, and all devices
        that are listed in <Link href="https://cvsweb.openbsd.org/log/src/sys/dev/usb/usbdevs" target="_blank" rel="noopener noreferrer" className="text-link hover:underline">usbdevs</Link>&nbsp;
        and <Link href="https://cvsweb.openbsd.org/log/src/sys/dev/pci/pcidevs" target="_blank" rel="noopener noreferrer" className="text-link hover:underline">pcidevs</Link>.
        The database will be updated as new drivers
        are added to OpenBSD, and as new devices are added to usbdevs and pcidevs.
        A shortfall of this approach is that devices that are supported by drivers
        that match on functional classes (for example, USB audio devices) are not currently
        included in the database.
      </p>
      <p>
        To resolve this shortfall, and to add devices that are not yet listed, the plan is
        to add a user submission form. How exactly this form will work is not yet determined,
        but the goal is to make it easy to submit complete device information, and easy to
        verify the submitted information.
      </p>
      <p>
        In addition to adding devices that are not yet listed, the plan is to add more
        information about the devices that are listed. Specifically, this will include
        information about any known issues with specific devices. This information will
        also come from user submissions, and will be verified before being added to the
        database.
      </p>
      <p>
        Ultimately, the plan is to also list devices that are NOT supported by OpenBSD. This
        will be useful for people who are looking for information about devices that they own,
        and want to know if they are supported by OpenBSD. This will also be useful for people
        who are looking for information about devices that they are considering purchasing,
        and want to know if they are supported by OpenBSD. It may also serve as inspiration
        to developers looking for projects to work on.
      </p>
    </div>
  );
}