
export interface Product {
  name: string;
  slug: string;
  category: string;
  description: string;
  network: string;
  featured: boolean;
}

export const products: Product[] = [
  {
    name: "C41QS",
    slug: "c41qs",
    category: "LPWA Module",
    description:
      "Ultra-low-power cellular connectivity for long-life IoT deployments.",
    network: "NB-IoT",
    featured: true,
  },
  {
    name: "C10QM",
    slug: "c10qm",
    category: "LTE Module",
    description:
      "Reliable LTE Cat 1 connectivity for industrial IoT applications.",
    network: "LTE Cat 1",
    featured: true,
  },
  {
    name: "C16QS",
    slug: "c16qs",
    category: "LTE Module",
    description:
      "Compact single-antenna LTE Cat 1bis connectivity for connected devices.",
    network: "LTE Cat 1bis",
    featured: true,
  },
  {
    name: "C20QM",
    slug: "c20qm",
    category: "LTE Module",
    description:
      "High-performance LTE Cat 4 connectivity for data-intensive IoT devices.",
    network: "LTE Cat 4",
    featured: true,
  },
  {
    name: "CQM220",
    slug: "cqm220",
    category: "5G Module",
    description:
      "Next-generation 5G RedCap connectivity for advanced IoT applications.",
    network: "5G RedCap",
    featured: true,
  },
];
