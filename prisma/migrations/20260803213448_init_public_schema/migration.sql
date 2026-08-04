-- CreateTable
CREATE TABLE "devices" (
    "id" BIGSERIAL NOT NULL,
    "vendor_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "bus" TEXT,
    "devs_name" TEXT,
    "dev_id" TEXT,
    "driver_id" BIGINT,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drivers" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "dev_type" TEXT NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issues" (
    "id" BIGSERIAL NOT NULL,
    "dev_id" BIGINT,
    "issue" TEXT NOT NULL,

    CONSTRAINT "issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT DEFAULT '',
    "pci_id" TEXT,
    "pcidev" TEXT,
    "usb_id" TEXT,
    "usbdev" TEXT,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "devices_name_key" ON "devices"("name");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_name_key" ON "drivers"("name");

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_dev_id_fkey" FOREIGN KEY ("dev_id") REFERENCES "devices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
