/*
# Seed Initial Data

## Overview
Populates the database with default categories, materials, contact settings, and site content.

## Data Seeded
1. **categories** - 8 default categories (Sand, Iron, Rock, Cement, Bricks, Aggregates, Tiles, Other Materials)
2. **materials** - 8 default materials with images and descriptions
3. **contact_settings** - Default business contact information
4. **site_content** - Hero, about, why-choose-us, footer content

## Notes
1. Uses ON CONFLICT to be idempotent
2. All material images are placeholders that admins can replace
3. Contact settings match the business info provided
*/

-- Seed categories
INSERT INTO categories (name, description, sort_order) VALUES
  ('Sand', 'Construction sand for all building needs', 1),
  ('Iron', 'Iron and steel reinforcement materials', 2),
  ('Rock', 'Rocks and stone materials', 3),
  ('Cement', 'Cement and binding materials', 4),
  ('Bricks', 'Bricks for wall construction', 5),
  ('Aggregates', 'Aggregates for concrete and construction', 6),
  ('Tiles', 'Flooring and wall tiles', 7),
  ('Other Materials', 'Other building materials', 8)
ON CONFLICT (name) DO NOTHING;

-- Seed materials (with category references)
INSERT INTO materials (name, category_id, description, price, unit, minimum_quantity, availability, image_url, features, sort_order)
SELECT
  'Sand', c.id, 'High-quality construction sand suitable for all types of construction work including plastering, masonry, and concrete mixing.',
  'Contact for Price', 'Ton', '1', 'available',
  'https://images.pexels.com/photos/38862399/pexels-photo-38862399.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Quality material|Suitable for construction|Available in required quantity|Bulk orders supported',
  1
FROM categories c WHERE c.name = 'Sand'
ON CONFLICT DO NOTHING;

INSERT INTO materials (name, category_id, description, price, unit, minimum_quantity, availability, image_url, features, sort_order)
SELECT
  'Iron', c.id, 'Premium quality TMT bars and iron rods for structural reinforcement in residential and commercial buildings.',
  'Contact for Price', 'Kg', '100', 'available',
  'https://images.pexels.com/photos/46167/iron-rods-reinforcing-bars-rods-steel-bars-46167.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'High tensile strength|TMT bars available|Various sizes|Bulk orders supported',
  2
FROM categories c WHERE c.name = 'Iron'
ON CONFLICT DO NOTHING;

INSERT INTO materials (name, category_id, description, price, unit, minimum_quantity, availability, image_url, features, sort_order)
SELECT
  'Rock', c.id, 'Hard rock and stone materials for foundation work, filling, and construction.',
  'Contact for Price', 'Ton', '1', 'available',
  'https://images.pexels.com/photos/17727059/pexels-photo-17727059.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Hard and durable|Various sizes available|Foundation grade|Bulk supply',
  3
FROM categories c WHERE c.name = 'Rock'
ON CONFLICT DO NOTHING;

INSERT INTO materials (name, category_id, description, price, unit, minimum_quantity, availability, image_url, features, sort_order)
SELECT
  'Cement', c.id, 'High-grade cement for all construction needs including concrete, plastering, and masonry work.',
  'Contact for Price', 'Bags', '10', 'available',
  'https://images.pexels.com/photos/29817952/pexels-photo-29817952.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'High strength|Premium brands|Consistent quality|Bulk orders supported',
  4
FROM categories c WHERE c.name = 'Cement'
ON CONFLICT DO NOTHING;

INSERT INTO materials (name, category_id, description, price, unit, minimum_quantity, availability, image_url, features, sort_order)
SELECT
  'Bricks', c.id, 'Quality red bricks and fly ash bricks for wall construction and masonry work.',
  'Contact for Price', 'Pieces', '500', 'available',
  'https://images.pexels.com/photos/36259359/pexels-photo-36259359.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Uniform size and shape|High compressive strength|Red and fly ash bricks|Bulk supply',
  5
FROM categories c WHERE c.name = 'Bricks'
ON CONFLICT DO NOTHING;

INSERT INTO materials (name, category_id, description, price, unit, minimum_quantity, availability, image_url, features, sort_order)
SELECT
  'Aggregates', c.id, 'Construction aggregates including 20mm, 40mm, and 60mm jelly stones for concrete and road work.',
  'Contact for Price', 'Ton', '1', 'available',
  'https://images.pexels.com/photos/15186541/pexels-photo-15186541.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Various sizes available|Washed and clean|Concrete grade|Bulk orders',
  6
FROM categories c WHERE c.name = 'Aggregates'
ON CONFLICT DO NOTHING;

INSERT INTO materials (name, category_id, description, price, unit, minimum_quantity, availability, image_url, features, sort_order)
SELECT
  'Tiles', c.id, 'Premium quality floor and wall tiles in various designs, sizes, and finishes.',
  'Contact for Price', 'Sq.ft', '100', 'available',
  'https://images.pexels.com/photos/7566201/pexels-photo-7566201.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Multiple designs|Floor and wall tiles|Various sizes|Quality assured',
  7
FROM categories c WHERE c.name = 'Tiles'
ON CONFLICT DO NOTHING;

INSERT INTO materials (name, category_id, description, price, unit, minimum_quantity, availability, image_url, features, sort_order)
SELECT
  'Other Building Materials', c.id, 'Other construction materials including blocks, lime, putty, waterproofing materials, and more.',
  'Contact for Price', 'Various', '1', 'available',
  'https://images.pexels.com/photos/13758319/pexels-photo-13758319.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Wide range of materials|Quality assured|Custom orders accepted|Bulk supply available',
  8
FROM categories c WHERE c.name = 'Other Materials'
ON CONFLICT DO NOTHING;

-- Seed contact settings
INSERT INTO contact_settings (
  business_name, contact_person_1, phone_1, contact_person_2, phone_2, whatsapp,
  email, address, village, mandal, district, state, pincode,
  latitude, longitude, maps_url
) VALUES (
  'Sri Ramligeshwara Building Materials',
  'J. Srinkath', '8185817805',
  'B. Manikanta', '9666005044',
  '919666005044',
  'sriramligeshwara@gmail.com',
  'Main Road, Choutuppal',
  'Choutuppal', 'Choutuppal', 'Yadadri Bhuvanagiri', 'Telangana', '508252',
  '17.2861', '78.9242',
  'https://www.google.com/maps/search/?api=1&query=17.2861,78.9242'
) ON CONFLICT DO NOTHING;

-- Seed site content
INSERT INTO site_content (section, title, content, data) VALUES
  (
    'hero',
    'SRI RAMLIGESHWARA',
    'Build Your Dreams With Quality Materials',
    jsonb_build_object(
      'subtitle', 'BUILDING MATERIALS',
      'tagline', 'Build Your Dreams With Quality Materials'
    )
  ),
  (
    'about',
    'ABOUT SRI RAMLIGESHWARA BUILDING MATERIALS',
    'Sri Ramligeshwara Building Materials is a trusted supplier of quality construction materials, serving builders, contractors, and homeowners across Telangana. We supply sand, iron, rock, cement, bricks, aggregates, tiles, and other essential building materials for residential homes, commercial buildings, and construction projects of all sizes. With a commitment to quality, competitive pricing, and reliable service, we ensure that your construction needs are met on time and to the highest standards. Our experienced team is dedicated to helping you find the right materials for your project, from foundation to finish.',
    jsonb_build_object('image_url', 'https://images.pexels.com/photos/32826199/pexels-photo-32826199.jpeg?auto=compress&cs=tinysrgb&h=650&w=940')
  ),
  (
    'why_choose_us',
    'WHY CHOOSE SRI RAMLIGESHWARA?',
    'We are committed to delivering the best building materials with exceptional service.',
    jsonb_build_object(
      'items', jsonb_build_array(
        jsonb_build_object('title', 'Quality Materials', 'description', 'Only the finest construction materials sourced from trusted suppliers.'),
        jsonb_build_object('title', 'Reliable Service', 'description', 'On-time delivery and dependable supply for your projects.'),
        jsonb_build_object('title', 'Competitive Pricing', 'description', 'Best market prices with transparent and fair dealings.'),
        jsonb_build_object('title', 'Fast Response', 'description', 'Quick response to all your material requests and enquiries.'),
        jsonb_build_object('title', 'Customer Support', 'description', 'Dedicated support to guide you through material selection.'),
        jsonb_build_object('title', 'Trusted Supplier', 'description', 'Years of experience serving the construction community.')
      )
    )
  ),
  (
    'footer',
    'SRI RAMLIGESHWARA BUILDING MATERIALS',
    'Build Your Dreams With Quality Materials',
    jsonb_build_object('copyright', 'All rights reserved.')
  ),
  (
    'announcement',
    'Welcome to Sri Ramligeshwara Building Materials',
    'All building materials available at the best prices. Contact us today for your construction needs.',
    jsonb_build_object('active', true)
  )
ON CONFLICT (section) DO NOTHING;

-- Seed gallery images
INSERT INTO gallery (title, description, category, image_url, sort_order) VALUES
  ('Construction Site', 'Active construction project with quality materials', 'Construction', 'https://images.pexels.com/photos/32826199/pexels-photo-32826199.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
  ('Steel Reinforcement', 'Iron and steel bars for structural strength', 'Materials', 'https://images.pexels.com/photos/46167/iron-rods-reinforcing-bars-rods-steel-bars-46167.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
  ('Cement Supply', 'Quality cement bags ready for delivery', 'Materials', 'https://images.pexels.com/photos/29817952/pexels-photo-29817952.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 3),
  ('Sand Quarry', 'High quality construction sand', 'Materials', 'https://images.pexels.com/photos/38862399/pexels-photo-38862399.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4),
  ('Building Construction', 'Building project in progress', 'Projects', 'https://images.pexels.com/photos/13758319/pexels-photo-13758319.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5),
  ('Material Yard', 'Organized building material storage', 'Business', 'https://images.pexels.com/photos/36003985/pexels-photo-36003985.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6)
ON CONFLICT DO NOTHING;
