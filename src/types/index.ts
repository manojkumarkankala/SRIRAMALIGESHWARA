export interface Profile {
  id: string;
  name: string;
  email: string | null;
  mobile: string | null;
  role: 'customer' | 'admin';
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
}

export type Availability = 'available' | 'out_of_stock' | 'limited_stock';

export interface Material {
  id: string;
  name: string;
  category_id: string | null;
  description: string | null;
  price: string | null;
  unit: string | null;
  minimum_quantity: string | null;
  availability: Availability;
  image_url: string | null;
  features: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  images?: MaterialImage[];
}

export interface MaterialImage {
  id: string;
  material_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export type RequestStatus = 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';

export interface DealRequest {
  id: string;
  request_id: string;
  customer_id: string | null;
  customer_name: string;
  mobile: string;
  village: string | null;
  mandal: string | null;
  district: string | null;
  delivery_address: string;
  material_id: string | null;
  material_name: string;
  quantity: string;
  unit: string;
  required_date: string | null;
  preferred_time: string | null;
  additional_requirements: string | null;
  message: string | null;
  reference_image_url: string | null;
  status: RequestStatus;
  admin_message: string | null;
  decline_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string | null;
  request_id: string | null;
  title: string;
  message: string;
  type: 'info' | 'request' | 'contact' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface Video {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  category: string;
  sort_order: number;
  created_at: string;
}

export interface SiteContent {
  id: string;
  section: string;
  title: string | null;
  content: string | null;
  image_url: string | null;
  data: Record<string, unknown>;
  updated_at: string;
}

export interface ContactSettings {
  id: string;
  business_name: string;
  contact_person_1: string | null;
  phone_1: string | null;
  contact_person_2: string | null;
  phone_2: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  village: string | null;
  mandal: string | null;
  district: string | null;
  state: string | null;
  pincode: string | null;
  latitude: string | null;
  longitude: string | null;
  maps_url: string | null;
  instagram: string | null;
  facebook: string | null;
  youtube: string | null;
  logo_url: string | null;
  hero_image_url: string | null;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  mobile: string;
  message: string;
  status: 'new' | 'read' | 'responded';
  created_at: string;
}

export interface AdminAudit {
  id: string;
  admin_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: string | null;
  created_at: string;
}
