export type SectionType = 
  | 'hero' 
  | 'benefits' 
  | 'problem' 
  | 'ingredients' 
  | 'video' 
  | 'reviews' 
  | 'packages' 
  | 'faq' 
  | 'contact';

export interface LandingPageSection {
  id: string;
  type: SectionType;
  isVisible: boolean;
  order: number;
}

export interface LandingPageConfig {
  announcementText: string;
  announcementEnabled: boolean;
  
  countdownEnabled: boolean;
  countdownEndTime: string;
  countdownText: string;

  trustBadgesEnabled: boolean;
  trustBadges: { id: string, text: string }[];
  
  heroTitle: string;
  heroSubtitle: string;
  heroCTA: string;
  heroSecondaryCTA: string;

  problemTitle: string;
  problems: { id: string, title: string, description: string, icon: string }[];

  solutionTitle: string;
  solutions: { id: string, title: string, description: string, icon: string }[];

  ingredientsTitle: string;
  ingredients: { id: string, name: string, description: string, value: string }[];

  howToUseTitle: string;
  howToUseSteps: { id: string, title: string, description: string, imageUrl: string }[];

  videoUrl: string;
  
  giftsEnabled: boolean;
  giftsTitle: string;
  gifts: { id: string, name: string, value: number, imageUrl: string, description: string }[];

  packagesTitle: string;
  packages: { id: string, name: string, quantity: number, regularPrice: number, salePrice: number, badge: string, description: string }[];

  faqTitle: string;
  faqs: { id: string, question: string, answer: string }[];

  contactEnabled: boolean;
  contactTitle: string;
  contactPhone: string;
  contactWhatsApp: string;
  contactFacebook: string;

  sections: LandingPageSection[];
}
