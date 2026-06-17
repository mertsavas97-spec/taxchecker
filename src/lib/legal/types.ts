export interface LegalPageSection {
  id: string;
  heading: string;
  paragraphs: string[];
  list?: string[];
}

export interface LegalPageContent {
  eyebrow?: string;
  summary: string;
  sections: LegalPageSection[];
  footer?: string;
}

export interface LegalRelatedLink {
  label: string;
  href: string;
  description?: string;
}
