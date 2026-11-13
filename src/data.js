export const initialProducts = [
  { id: 1, name: 'Everyday Oversized Shirt', category: 'Tops', price: 390, image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=900&q=85', colors: ['White', 'Beige', 'Black'], sizes: ['S','M','L','XL'], stock: 24, description: 'เสื้อเชิ้ตทรง Oversized ', isNew: true },
  { id: 2, name: 'Soft Knit Cardigan', category: 'Tops', price: 450, image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=900&q=85', colors: ['Cream', 'Brown'], sizes: ['S','M','L'], stock: 16, description: 'คาร์ดิแกนผ้านุ่ม  ', isNew: true },
  { id: 3, name: 'Long jeans', category: 'Bottoms', price: 490, image: 'https://images.unsplash.com/photo-1789110520732-77b1e55c32ea?auto=format&fit=crop&fm=jpg&q=80&w=900', colors: ['Beige', 'Black'], sizes: ['S','M','L','XL'], stock: 18, description: 'กางเกงยีนส์ขายาว ', isNew: false },
  { id: 4, name: 'Daily Midi Dress', category: 'Dresses', price: 590, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&q=85', colors: ['Black', 'Brown'], sizes: ['S','M','L'], stock: 12, description: 'เดรสทรงมินิมอล ', isNew: true },
  { id: 5, name: 'Basic Cotton Tee', category: 'Tops', price: 290, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=85', colors: ['White', 'Black', 'Grey'], sizes: ['S','M','L','XL'], stock: 35, description: 'เสื้อยืดคอตตอนสัมผัสนุ่ม ', isNew: false },
  { id: 6, name: 'Minimal Pleated Skirt', category: 'Bottoms', price: 420, image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=900&q=85', colors: ['Cream', 'Black'], sizes: ['S','M','L'], stock: 9, description: 'กระโปรงพลีตทรงสวย ', isNew: false },
  { id: 7, name: 'Everyday Shoulder Bag', category: 'Accessories', price: 520, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900&q=85', colors: ['Brown', 'Black'], sizes: ['One Size'], stock: 7, description: 'กระเป๋าทรงคลาสสิก ', isNew: false },
  { id: 8, name: 'Relaxed Shirt', category: 'Tops', price: 480, image: 'https://images.unsplash.com/photo-1789110520769-c18355b70c63?auto=format&fit=crop&fm=jpg&q=60&w=900', colors: ['White', 'Sand'], sizes: ['S','M','L'], stock: 14, description: 'เสื้อสายเดี่ยว', isNew: true }
];

export const initialReviews = [
  { id: 1, productId: 1, name: 'Mint', rating: 5, comment: 'ผ้าดีมาก ทรงสวย ใส่สบายค่ะ' },
  { id: 2, productId: 1, name: 'Ploy', rating: 4, comment: 'สีตรงปก' },
  { id: 3, productId: 3, name: 'Jane', rating: 5, comment: 'ทรงสวยมาก ใส่แล้วดูสูงขึ้น' }
];
export const categories = ['All', 'Tops', 'Bottoms', 'Dresses', 'Accessories'];
export const money = n => '฿' + Number(n).toLocaleString('th-TH');
