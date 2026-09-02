import "dotenv/config";
import { readFile } from "node:fs/promises";
import prisma from "../lib/prisma";


const driverConfig = {
  acx:
  {
    name: "acx",
    devType: "network/wireless",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_acx_pci.c",
    removeVendor: true,
  },
  an:
  {
    name: "an",
    devType: "network/wireless",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_an_pci.c",
    removeVendor: true,
  },
  age:
  {
    name: "age",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    path: "/usr/src/sys/dev/pci/if_age.c",
    removeVendor: true,
  },
  alc:
  {
    name: "alc",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    path: "/usr/src/sys/dev/pci/if_alc.c",
    removeVendor: true,
  },
  ale:
  {
    name: "ale",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    path: "/usr/src/sys/dev/pci/if_ale.c",
    removeVendor: true,
  },
  aq:
  {
    name: "aq",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    path: "/usr/src/sys/dev/pci/if_aq_pci.c",
    removeVendor: true,
  },
  ath:
  {
	  // won't match anything
    name: "ath",
    devType: "network/wireless",
    bus: "PCI",
    filter: `PCI_PRODUCT\(pa->pa_id\) == \\S+`,
    match: `PCI_PRODUCT\(pa->pa_id\) == (\\S+)`,
    path: "/usr/src/sys/dev/pci/if_ath_pci.c",
    removeVendor: true,
  },
  athn:
  {
    name: "athn",
    devType: "network/wireless",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_athn_pci.c",
    removeVendor: true,
  },
  atu:
  {
    name: "atu",
    devType: "network/wireless",
    bus: "USB",
    filter: "^\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*}\\s*,?\\s*$",
    match: "^\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_(\\S+)\\s*}\\s*,?\\s*$",
    path: "/usr/src/sys/dev/usb/if_atu.c",
    removeVendor: true,
  },
  aue:
  {
    name: "aue",
    devType: "network/wired",
    bus: "USB",
    filter: `^\\s*{{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},`,
    match: `^\\s*{{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_([^\\s}]*)\\s*},`,
    path: "/usr/src/sys/dev/usb/if_aue.c",
    removeVendor: true,
  },
  axe:
  {
    name: "axe",
    devType: "network/wired",
    bus: "USB",
    filter: `^\\s*{\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},`,
    match: `^\\s*{\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_([^\\s}]*)\\s*},`,
    path: "/usr/src/sys/dev/usb/if_axe.c",
    removeVendor: true,
  },
  axen:
  {
    name: "axen",
    devType: "network/wired",
    bus: "USB",
    filter: `^\\s*{\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*}, AX179`,
    match: `^\\s*{\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_([^\\s}]*)\\s*},`,
    path: "/usr/src/sys/dev/usb/if_axen.c",
    removeVendor: true,
  },
  bce:
  {
    name: "bce",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    path: "/usr/src/sys/dev/pci/if_bce.c",
    removeVendor: true,
  },
  bge:
  {
    name: "bge",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    path: "/usr/src/sys/dev/pci/if_bge.c",
    removeVendor: true,
  },
  bnx:
  {
    name: "bnx",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    path: "/usr/src/sys/dev/pci/if_bnx.c",
    removeVendor: true,
  },
  bnxt:
  {
    name: "bnxt",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    path: "/usr/src/sys/dev/pci/if_bnxt.c",
    removeVendor: true,
  },
  bwfm_usb:
  {
    name: "bwfm",
    devType: "network/wireless",
    bus: "USB",
    filter: `^\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_(\\S+)\\s*},?`,
    path: "/usr/src/sys/dev/usb/if_bwfm_usb.c",
    removeVendor: true,
  },
  cas:
  {
    name: "cas",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    path: "/usr/src/sys/dev/pci/if_cas.c",
    removeVendor: true,
  },
  cdce:
  {
    name: "cdce",
    devType: "network/wired",
    bus: "USB",
    filter: `^\\s*{\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},`,
    match: `^\\s*{\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_([^\\s}]*)\\s*},`,
    path: "/usr/src/sys/dev/usb/if_cdce.c",
    removeVendor: true,
  },
  cue:
  {
    name: "cue",
    devType: "network/wired",
    bus: "USB",
    filter: `^\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_(\\S+)\\s*},?`,
    path: "/usr/src/sys/dev/usb/if_cue.c",
    removeVendor: true,
  },
  dc:
  {
    name: "dc",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    path: "/usr/src/sys/dev/pci/if_dc_pci.c",
    removeVendor: true,
  },
  de:
  {
	  // won't match anything
    name: "de",
    devType: "network/wired",
    bus: "PCI",
    filter: `PCI_CHIPID\(pa->pa_id\) == CHIPID_\\d+`,
    match: `PCI_CHIPID\(pa->pa_id\) == CHIPID_(\\d+)`,
    path: "/usr/src/sys/dev/pci/if_de.c",
    removeVendor: false,
  },
  dwqe:
  {
    name: "dwqe",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: ["EHL_PSE1_RGMII_1G"],
    path: "/usr/src/sys/dev/pci/if_dwqe_pci.c",
    removeVendor: true,
  },
  em:
  {
    name: "em",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_em.c",
    removeVendor: true,
  },
  ep:
  {
    name: "ep",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_ep_pci.c",
    removeVendor: true,
  },
  epic:
  {
    name: "epic",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_epic_pci.c",
    removeVendor: true,
  },
  et:
  {
    name: "et",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_et.c",
    removeVendor: true,
  },
  fxp:
  {
    name: "fxp",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_fxp_pci.c",
    removeVendor: true,
  },
  gem:
  {
    name: "gem",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_gem_pci.c",
    removeVendor: true,
  },
  hme:
  {
	  // won't match anything
    name: "hme",
    devType: "network/wired",
    bus: "PCI",
    filter: `PCI_PRODUCT\(pa->pa_id\) == \\S+`,
    match: `PCI_PRODUCT\(pa->pa_id\) == (\\S+)`,
    path: "/usr/src/sys/dev/pci/if_hme_pci.c",
    removeVendor: false,
  },
  iavf:
  {
    name: "iavf",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_iavf.c",
    removeVendor: true,
  },
  ice:
  {
    name: "ice",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_ice.c",
    removeVendor: true,
  },
  igc:
  {
    name: "igc",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_igc.c",
    removeVendor: true,
  },
  ix:
  {
    name: "ix",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_ix.c",
    removeVendor: true,
  },
  ixgb:
  {
    name: "ixgb",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_ixgb.c",
    removeVendor: true,
  },
  ixl:
  {
    name: "ixl",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*\\S*,\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*\\S*,\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_([^\\s,]+),?\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_ixl.c",
    removeVendor: true,
  },
  ixv:
  {
    name: "ixv",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_ixv.c",
    removeVendor: true,
  },
  jme:
  {
    name: "jme",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_jme.c",
    removeVendor: true,
  },
  kue:
  {
    name: "kue",
    devType: "network/wired",
    bus: "USB",
    filter: `^\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_(\\S+)\\s*},?`,
    path: "/usr/src/sys/dev/usb/if_kue.c",
    removeVendor: true,
  },
  lge:
  {
    name: "lge",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_lge.c",
    removeVendor: true,
  },
  lii:
  {
    name: "lii",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_lii.c",
    removeVendor: true,
  },
  mcx:
  {
    name: "mcx",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_mcx.c",
    removeVendor: true,
  },
  mos:
  {
    name: "mos",
    devType: "network/wired",
    bus: "USB",
    filter: `^\\s*{\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},`,
    match: `^\\s*{\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_([^\\s}]*)\\s*},`,
    path: "/usr/src/sys/dev/usb/if_mos.c",
    removeVendor: true,
  },
  msk:
  {
    name: "msk",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_msk.c",
    removeVendor: true,
  },
  mtd:
  {
    name: "mtd",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_mtd_pci.c",
    removeVendor: true,
  },
  mtw:
  {
    name: "mtw",
    devType: "network/wireless",
    bus: "USB",
    filter: "^\\s*USB_ID\\(",
    match: "^\\s*USB_ID\\((\\S+),\\s+(\\S+)\\),?\\s*$",
    path: "/usr/src/sys/dev/usb/if_mtw.c",
    removeVendor: false,
  },
  mue:
  {
    name: "mue",
    devType: "network/wired",
    bus: "USB",
    filter: `^\\s*{\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},`,
    match: `^\\s*{\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_([^\\s}]*)\\s*},`,
    path: "/usr/src/sys/dev/usb/if_mue.c",
    removeVendor: true,
  },
  myx:
  {
    name: "myx",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_myx.c",
    removeVendor: true,
  },
  ne:
  {
    name: "ne",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_[^\\s,]+,?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_([^\\s,]+),?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_ne_pci.c",
    removeVendor: true,
  },
  nep:
  {
	  // won't match anything
    name: "nep",
    devType: "network/wired",
    bus: "PCI",
    filter: `PCI_PRODUCT\(pa->pa_id\) == PCI_PRODUCT_\\S+`,
    match: `PCI_PRODUCT\(pa->pa_id\) == PCI_PRODUCT_(\\S+)`,
    path: "/usr/src/sys/dev/pci/if_nep.c",
    removeVendor: true,
  },
  nfe:
  {
    name: "nfe",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_nfe.c",
    removeVendor: true,
  },
  ngbe:
  {
    name: "ngbe",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_ngbe.c",
    removeVendor: true,
  },
  nge:
  {
	  // won't match anything
    name: "nge",
    devType: "network/wired",
    bus: "PCI",
    filter: `PCI_PRODUCT\(pa->pa_id\) == PCI_PRODUCT_\\S+`,
    match: `PCI_PRODUCT\(pa->pa_id\) == PCI_PRODUCT_(\\S+)`,
    path: "/usr/src/sys/dev/pci/if_nge.c",
    removeVendor: true,
  },
  oce:
  {
    name: "oce",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_oce.c",
    removeVendor: true,
  },
  otus:
  {
    name: "otus",
    devType: "network/wireless",
    bus: "USB",
    filter: `^\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_(\\S+)\\s*},?`,
    path: "/usr/src/sys/dev/usb/if_otus.c",
    removeVendor: true,
  },
  pcn:
  {
    name: "pcn",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_pcn.c",
    removeVendor: true,
  },
  re:
  {
    name: "re",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_re_pci.c",
    removeVendor: true,
  },
  rge:
  {
    name: "rge",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_rge.c",
    removeVendor: true,
  },
  rl:
  {
    name: "rl",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_rl_pci.c",
    removeVendor: true,
  },
  rsu:
  {
    name: "rsu",
    devType: "network/wireless",
    bus: "USB",
    filter: `^\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_(\\S+)\\s*},?`,
    path: "/usr/src/sys/dev/usb/if_rsu.c",
    removeVendor: true,
  },
  rum:
  {
    name: "rum",
    devType: "network/wireless",
    bus: "USB",
    filter: `^\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_(\\S+)\\s*},?`,
    path: "/usr/src/sys/dev/usb/if_rum.c",
    removeVendor: true,
  },
  se:
  {
    name: "se",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: ["965", "966", "968"],
    path: "/usr/src/sys/dev/pci/if_se.c",
    removeVendor: true,
  },
  sf:
  {
    name: "sf",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_sf_pci.c",
    removeVendor: true,
  },
  sis:
  {
    name: "sis",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_sis.c",
    removeVendor: true,
  },
  sk:
  {
    name: "sk",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_sk.c",
    removeVendor: true,
  },
  smsc:
  {
    name: "smsc",
    devType: "network/wired",
    bus: "USB",
    filter: `^\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_(\\S+)\\s*},?`,
    path: "/usr/src/sys/dev/usb/if_smsc.c",
    removeVendor: true,
  },
  ste:
  {
    name: "ste",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_ste.c",
    removeVendor: true,
  },
  stge:
  {
    name: "stge",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_stge.c",
    removeVendor: true,
  },
  tht:
  {
    name: "tht",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_[^\\s,]+,\\s*\\d\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_([^\\s,]+),\\s*\\d\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_tht.c",
    removeVendor: true,
  },
  ti:
  {
    name: "ti",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_ti_pci.c",
    removeVendor: true,
  },
  tl:
  {
    name: "tl",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_[^\\s,]+,\\s*\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_([^\\s,]+),\\s*\\S+\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_tl.c",
    removeVendor: true,
  },
  txp:
  {
    name: "txp",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_txp.c",
    removeVendor: true,
  },
  uaq:
  {
    name: "uaq",
    devType: "network/wired",
    bus: "USB",
    filter: `^\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_(\\S+)\\s*},?`,
    path: "/usr/src/sys/dev/usb/if_uaq.c",
    removeVendor: true,
  },
  uath:
  {
    name: "uath",
    devType: "network/wireless",
    bus: "USB",
    filter: "^\\s*UATH_DEV_U.\\(",
    match: "^\\s*UATH_DEV_U.\\((\\S+),\\s+(\\S+)\\),?\\s*$",
    path: "/usr/src/sys/dev/usb/if_uath.c",
    removeVendor: false,
  },
  udav:
  {
    name: "udav",
    devType: "network/wired",
    bus: "USB",
    filter: `^\\s*{\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},`,
    match: `^\\s*{\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_([^\\s}]*)\\s*},`,
    path: "/usr/src/sys/dev/usb/if_udav.c",
    removeVendor: true,
  },
  upgt:
  {
    name: "upgt",
    devType: "network/wireless",
    bus: "USB",
    filter: `^\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_(\\S+)\\s*},?`,
    path: "/usr/src/sys/dev/usb/if_upgt.c",
    removeVendor: true,
  },
  ural:
  {
    name: "ural",
    devType: "network/wireless",
    bus: "USB",
    filter: `^\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_(\\S+)\\s*},?`,
    path: "/usr/src/sys/dev/usb/if_ral.c",
    removeVendor: true,
  },
  ure:
  {
    name: "ure",
    devType: "network/wired",
    bus: "USB",
    filter: `^\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_(\\S+)\\s*},?`,
    path: "/usr/src/sys/dev/usb/if_ure.c",
    removeVendor: true,
  },
  url:
  {
    name: "url",
    devType: "network/wired",
    bus: "USB",
    filter: `^\\s*{\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},`,
    match: `^\\s*{\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_([^\\s}]*)\\s*},`,
    path: "/usr/src/sys/dev/usb/if_url.c",
    removeVendor: true,
  },
  urtw:
  {
    name: "urtw",
    devType: "network/wireless",
    bus: "USB",
    filter: "^\\s*URTW_DEV_RTL8187B?\\(",
    match: "^\\s*URTW_DEV_RTL8187B?\\((\\S+),\\s+(\\S+)\\),?\\s*$",
    path: "/usr/src/sys/dev/usb/if_urtw.c",
    removeVendor: false,
  },
  vge:
  {
    name: "vge",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_vge.c",
    removeVendor: true,
  },
  vr:
  {
    name: "vr",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_[^\\s,]+,`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_([^\\s,]+),`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_vr.c",
    removeVendor: true,
  },
  vte:
  {
    name: "vte",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_vte.c",
    removeVendor: true,
  },
  wb:
  {
    name: "wb",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_wb.c",
    removeVendor: true,
  },
  wi_usb:
  {
    name: "wi",
    devType: "network/wireless",
    bus: "USB",
    filter: `^\\s*{{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},`,
    match: `^\\s*{{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_(\\S+)\\s*},`,
    path: "/usr/src/sys/dev/usb/if_wi_usb.c",
    removeVendor: true,
  },
  xge:
  {
    name: "xge",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_xge.c",
    removeVendor: true,
  },
  xl:
  {
    name: "xl",
    devType: "network/wired",
    bus: "PCI",
    filter: `^\\s*{\\s*PCI_VENDOR_\\S+\\s*,\\s*PCI_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*PCI_VENDOR_(\\S+)\\s*,\\s*PCI_PRODUCT_(\\S+)\\s*},?`,
    exceptions: [],
    path: "/usr/src/sys/dev/pci/if_xl_pci.c",
    removeVendor: true,
  },
  zyd:
  {
    name: "zyd",
    devType: "network/wireless",
    bus: "USB",
    filter: "^\\s*ZYD_ZD1211B?_DEV\\(",
    match: "^\\s*ZYD_ZD1211B?_DEV\\((\\S+),\\s+(\\S+)\\),?\\s*$",
    path: "/usr/src/sys/dev/usb/if_zyd.c",
    removeVendor: false,
  },
};

const currDriver = "athn";

const deviceDevsPath = driverConfig[currDriver].bus === "USB" ?
  "/usr/src/sys/dev/usb/usbdevs" : "/usr/src/sys/dev/pci/pcidevs";

type DeviceRecord = {
  vendor_dev: string;
  device_dev: string;
};

function extractDeviceFields(text: string): DeviceRecord[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => new RegExp(driverConfig[currDriver].filter).test(line))
    .map((line) => {
      const match = line.match(new RegExp(driverConfig[currDriver].match));
      if (!match) {
        return null;
      }

      return {
        vendor_dev: match[1],
        device_dev: driverConfig[currDriver].removeVendor ?
          match[2].substring(match[1].length + 1) : match[2],
      };
    })
    .filter(e => !driverConfig[currDriver].exceptions.includes(e.device_dev))
    .filter((value): value is DeviceRecord => Boolean(value));

}

async function findDev(vendor_dev: string, device_dev: string, deviceDevsText: string, driverId: bigint): Promise<void> {
  const regex = new RegExp(`^product\\s+${vendor_dev}\\s+${device_dev}\\s+(\\S+)[^\\S\\r\\n]+(.+)`, 'm');
  const match = deviceDevsText.match(regex);
  if (match) {
    console.log(`${driverConfig[currDriver].bus} device found: ${match[1]} ${match[2]}`);
    const deviceDevId = match[1];
    const deviceName = match[2];
// /*
    const vendor = await prisma.vendors.findFirst({
      where: { [driverConfig[currDriver].bus === "USB" ? "usbdev" : "pcidev"]: vendor_dev },
    });
    if (vendor) {
      console.log(`${driverConfig[currDriver].bus} vendor found: ${vendor.id} ${vendor.name}`);
    } else {
      throw new Error(`${driverConfig[currDriver].bus} vendor not found for ${vendor_dev}`);
    }

    const existing = await prisma.devices.findFirst({
      where: {
        dev_id: deviceDevId,
        vendor_id: vendor.id,
        driver_id: driverId,
      },
    });
    if (!existing) {
      await prisma.devices.create({
        data: {
          dev_id: deviceDevId,
          devs_name: device_dev,
          name: deviceName,
          vendor_id: vendor.id,
          driver_id: driverId,
          bus: driverConfig[currDriver].bus ?? null,
          support_status: "supported",
        },
      });
      console.log(`Device created: ${deviceDevId} ${deviceName}\n`);
    } else {
      console.log(`Device already exists: ${existing.dev_id} ${existing.name}!!!\n`);
    }
// */
  } else {
    throw new Error(`${driverConfig[currDriver].bus} device not found: ${vendor_dev} ${device_dev}`);
  }
}

async function importDevices(filePath: string, driverId: bigint): Promise<void> {
  let text;
  try {
    text = await readFile(filePath, "utf8");
  } catch (e) {
    console.log((e as Error).message);
    process.exit(-1);
  }
  const extracted = extractDeviceFields(text);

  const deviceDevsText = await readFile(deviceDevsPath, "utf8");

  for (const device of extracted) {
//  for (let i = 0; i < Math.min(extracted.length, 10); i++) {
//    const device = extracted[i];
//    console.log(`Device: ${device.vendor_dev} ${device.device_dev}`);
    try {
      await findDev(device.vendor_dev, device.device_dev, deviceDevsText, driverId);
    } catch (error) {
      console.error(`Failed to add ${driverConfig[currDriver].bus} device: ${device.vendor_dev} ${device.device_dev}`, error);
    }
  }
}


async function importDriver(): Promise<void> {
  let driverId: bigint | undefined;

  // Implementation for importing the driver goes here
  const existingDriver = await prisma.drivers.findFirst({
    where: { name: driverConfig[currDriver].name },
  });
  if (!existingDriver) {
    const driver = await prisma.drivers.create({
      data: {
        name: driverConfig[currDriver].name,
        dev_type: driverConfig[currDriver].devType,
      },
    });
    console.log(`Driver created: ${driver.id} ${driver.name}`);
    driverId = driver.id;
  } else {
    console.log(`Driver already exists: ${existingDriver.id} ${existingDriver.name}`);
    driverId = existingDriver.id;
  }

  importDevices(driverConfig[currDriver].path, driverId)
      .catch((error) => {
        console.error("Device import failed:", error);
        process.exitCode = 1;
      })
      .finally(async () => {
        await prisma.$disconnect();
      });
}


importDriver()
  .catch((error) => {
    console.error("Driver import failed:", error);
    process.exitCode = 1;
  });
