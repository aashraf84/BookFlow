import { db } from './src/lib/db';

async function seed() {
  console.log('🌱 Seeding database...');

  // Create branches
  const branch1 = await db.branch.upsert({
    where: { code: 'DT-01' },
    update: {},
    create: { name: 'Downtown Store', code: 'DT-01', address: '123 Main St, Lahore', phone: '042-35761234', email: 'downtown@bookflow.pk', manager: 'Ahmed Khan' },
  });
  const branch2 = await db.branch.upsert({
    where: { code: 'ML-01' },
    update: {},
    create: { name: 'Mall of Lahore', code: 'ML-01', address: 'Mall of Lahore, Gulberg', phone: '042-35761235', email: 'mall@bookflow.pk', manager: 'Fatima Rizvi' },
  });
  const branch3 = await db.branch.upsert({
    where: { code: 'ISB-01' },
    update: {},
    create: { name: 'Islamabad Branch', code: 'ISB-01', address: 'Jinnah Super, F-7 Markaz', phone: '051-28761234', email: 'islamabad@bookflow.pk', manager: 'Hassan Ali' },
  });

  console.log(`✅ Created branches`);

  // Create warehouses
  const wh1 = await db.warehouse.upsert({
    where: { code: 'WH-MAIN' },
    update: {},
    create: { name: 'Main Warehouse', code: 'WH-MAIN', address: '789 Storage Ave, Lahore', branchId: branch1.id },
  });
  const wh2 = await db.warehouse.upsert({
    where: { code: 'WH-MALL' },
    update: {},
    create: { name: 'Mall Warehouse', code: 'WH-MALL', address: 'Mall of Lahore, B2 Level', branchId: branch2.id },
  });
  const wh3 = await db.warehouse.upsert({
    where: { code: 'WH-ISB' },
    update: {},
    create: { name: 'Islamabad Warehouse', code: 'WH-ISB', address: 'I-9 Industrial Area, Islamabad', branchId: branch3.id },
  });

  console.log(`✅ Created warehouses`);

  // Create stationery categories
  const catNotebooks = await db.stationeryCategory.upsert({
    where: { id: 'cat-notebooks' },
    update: {},
    create: { id: 'cat-notebooks', name: 'Notebooks & Registers', type: 'notebooks' },
  });
  const catPens = await db.stationeryCategory.upsert({
    where: { id: 'cat-pens' },
    update: {},
    create: { id: 'cat-pens', name: 'Pens & Pencils', type: 'pens' },
  });
  const catArt = await db.stationeryCategory.upsert({
    where: { id: 'cat-art' },
    update: {},
    create: { id: 'cat-art', name: 'Art Supplies', type: 'art' },
  });
  const catSchool = await db.stationeryCategory.upsert({
    where: { id: 'cat-school' },
    update: {},
    create: { id: 'cat-school', name: 'School Supplies', type: 'school' },
  });
  const catOffice = await db.stationeryCategory.upsert({
    where: { id: 'cat-office' },
    update: {},
    create: { id: 'cat-office', name: 'Office Supplies', type: 'office' },
  });
  const catMarkers = await db.stationeryCategory.upsert({
    where: { id: 'cat-markers' },
    update: {},
    create: { id: 'cat-markers', name: 'Markers & Highlighters', type: 'markers' },
  });
  const catEducational = await db.stationeryCategory.upsert({
    where: { id: 'cat-educational' },
    update: {},
    create: { id: 'cat-educational', name: 'Educational Materials', type: 'educational' },
  });

  console.log('✅ Created stationery categories');

  // Create stationery products
  const products = [
    { name: 'Premium Notebook A5', sku: 'STA-NB-001', categoryId: catNotebooks.id, brand: 'Moleskine', price: 12.99, costPrice: 6.50, barcode: '8901234567890', unit: 'piece', minOrderQty: 1 },
    { name: 'Spiral Bound Notebook B5', sku: 'STA-NB-002', categoryId: catNotebooks.id, brand: 'Oxford', price: 8.99, costPrice: 4.00, discount: 10, barcode: '8901234567891', unit: 'piece', minOrderQty: 1 },
    { name: 'Cash Register Book', sku: 'STA-NB-003', categoryId: catNotebooks.id, brand: 'National', price: 6.49, costPrice: 3.00, barcode: '8901234567891a', unit: 'piece', minOrderQty: 5 },
    { name: 'Gel Pen Set (12-pack)', sku: 'STA-PN-001', categoryId: catPens.id, brand: 'Pilot', price: 15.99, costPrice: 8.00, discount: 5, barcode: '8901234567892', unit: 'pack', minOrderQty: 1 },
    { name: 'Mechanical Pencil 0.5mm', sku: 'STA-PN-002', categoryId: catPens.id, brand: 'Pentel', price: 4.99, costPrice: 2.00, barcode: '8901234567893', unit: 'piece', minOrderQty: 5 },
    { name: 'Ballpoint Pen Blue (Box of 50)', sku: 'STA-PN-003', categoryId: catPens.id, brand: 'Bic', price: 22.99, costPrice: 12.00, barcode: '8901234567893a', unit: 'box', minOrderQty: 2 },
    { name: 'Watercolor Set 24 Colors', sku: 'STA-AR-001', categoryId: catArt.id, brand: 'Winsor & Newton', price: 34.99, costPrice: 18.00, barcode: '8901234567894', unit: 'set', minOrderQty: 1 },
    { name: 'Sketch Pad A4', sku: 'STA-AR-002', categoryId: catArt.id, brand: 'Strathmore', price: 9.99, costPrice: 4.50, discount: 15, barcode: '8901234567895', unit: 'piece', minOrderQty: 2 },
    { name: 'School Pencil Box', sku: 'STA-SC-001', categoryId: catSchool.id, brand: 'Faber-Castell', price: 7.99, costPrice: 3.50, barcode: '8901234567896', unit: 'piece', minOrderQty: 10 },
    { name: 'Ruler Set (30cm)', sku: 'STA-SC-002', categoryId: catSchool.id, brand: 'Helix', price: 3.49, costPrice: 1.50, barcode: '8901234567897', unit: 'piece', minOrderQty: 12 },
    { name: 'Geometry Box', sku: 'STA-SC-003', categoryId: catSchool.id, brand: 'Maped', price: 9.99, costPrice: 4.50, barcode: '8901234567897a', unit: 'piece', minOrderQty: 8 },
    { name: 'Stapler Heavy Duty', sku: 'STA-OF-001', categoryId: catOffice.id, brand: 'Swingline', price: 24.99, costPrice: 12.00, barcode: '8901234567898', unit: 'piece', minOrderQty: 1 },
    { name: 'Binder Clips Set', sku: 'STA-OF-002', categoryId: catOffice.id, brand: 'ACCO', price: 5.99, costPrice: 2.50, discount: 20, barcode: '8901234567899', unit: 'box', minOrderQty: 6 },
    { name: 'Highlighter Set (6 Colors)', sku: 'STA-MK-001', categoryId: catMarkers.id, brand: 'Stabilo', price: 11.99, costPrice: 6.00, barcode: '8901234567900', unit: 'set', minOrderQty: 5 },
    { name: 'Whiteboard Markers (4-pack)', sku: 'STA-MK-002', categoryId: catMarkers.id, brand: 'Expo', price: 8.49, costPrice: 4.00, barcode: '8901234567901', unit: 'pack', minOrderQty: 8 },
    { name: 'World Map Poster (Laminated)', sku: 'STA-ED-001', categoryId: catEducational.id, brand: 'National Geographic', price: 14.99, costPrice: 7.00, barcode: '8901234567902', unit: 'piece', minOrderQty: 3 },
    { name: 'Multiplication Table Chart', sku: 'STA-ED-002', categoryId: catEducational.id, brand: 'Carson Dellosa', price: 3.99, costPrice: 1.50, barcode: '8901234567903', unit: 'piece', minOrderQty: 15 },
  ];

  for (const p of products) {
    await db.stationeryProduct.upsert({
      where: { sku: p.sku },
      update: {},
      create: p,
    });
  }

  console.log('✅ Created stationery products');

  // Create book categories
  const categories = [
    { id: 'cat-fiction', name: 'Fiction', type: 'fiction' },
    { id: 'cat-nonfiction', name: 'Non-Fiction', type: 'non-fiction' },
    { id: 'cat-academic', name: 'Academic', type: 'university' },
    { id: 'cat-school', name: 'School Books', type: 'school' },
    { id: 'cat-children', name: "Children's Books", type: 'children' },
    { id: 'cat-religious', name: 'Religious Books', type: 'religious' },
    { id: 'cat-competitive', name: 'Competitive Exam', type: 'competitive' },
    { id: 'cat-professional', name: 'Professional', type: 'professional' },
  ];

  for (const cat of categories) {
    await db.bookCategory.upsert({
      where: { id: cat.id },
      update: {},
      create: cat,
    });
  }

  console.log('✅ Created book categories');

  // Create authors
  const authors = [
    { id: 'author-1', name: 'J.K. Rowling', nationality: 'British', bio: 'Best-selling author of the Harry Potter series', email: 'jk@publisher.com' },
    { id: 'author-2', name: 'Stephen King', nationality: 'American', bio: 'Master of horror and suspense fiction', email: 'sk@publisher.com' },
    { id: 'author-3', name: 'Malcolm Gladwell', nationality: 'Canadian', bio: 'Journalist and author of popular non-fiction', email: 'mg@publisher.com' },
    { id: 'author-4', name: 'Khalid Hosseini', nationality: 'Afghan-American', bio: 'Author of The Kite Runner and A Thousand Splendid Suns', email: 'kh@publisher.com' },
    { id: 'author-5', name: 'Mujtaba Hussain', nationality: 'Pakistani', bio: 'Renowned Urdu satirical writer', email: 'mh@publisher.com' },
    { id: 'author-6', name: 'Umera Ahmed', nationality: 'Pakistani', bio: 'Bestselling Urdu novelist and screenwriter', email: 'ua@publisher.com' },
    { id: 'author-7', name: 'Dr. Abdul Kalam', nationality: 'Indian', bio: 'Former President of India and inspirational author', email: 'ak@publisher.com' },
  ];

  for (const a of authors) {
    await db.author.upsert({
      where: { id: a.id },
      update: {},
      create: a,
    });
  }

  console.log('✅ Created authors');

  // Create publishers
  const publishers = [
    { id: 'pub-1', name: 'Penguin Random House', email: 'info@penguin.com', phone: '+1-212-782-9000', address: 'New York, NY' },
    { id: 'pub-2', name: 'HarperCollins', email: 'info@harpercollins.com', phone: '+1-212-207-7000', address: 'New York, NY' },
    { id: 'pub-3', name: 'Oxford University Press Pakistan', email: 'info@oup.com.pk', phone: '+92-42-35761234', address: 'Lahore, Pakistan' },
    { id: 'pub-4', name: 'Ferozsons Publishers', email: 'info@ferozsons.com', phone: '+92-51-28761234', address: 'Lahore, Pakistan' },
    { id: 'pub-5', name: 'Caravan Press', email: 'info@caravanpress.com', phone: '+92-21-35612345', address: 'Karachi, Pakistan' },
  ];

  for (const p of publishers) {
    await db.publisher.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
  }

  console.log('✅ Created publishers');

  // Create books
  const books = [
    { isbn: '978-0747532699', title: "Harry Potter and the Philosopher's Stone", authorId: 'author-1', publisherId: 'pub-1', categoryId: 'cat-fiction', price: 14.99, costPrice: 7.00, barcode: '9780747532699', language: 'English', pages: 309, publishYear: 1997, description: 'The first book in the Harry Potter series' },
    { isbn: '978-1501175466', title: 'The Shining', authorId: 'author-2', publisherId: 'pub-2', categoryId: 'cat-fiction', price: 16.99, costPrice: 8.50, discount: 10, barcode: '9781501175466', language: 'English', pages: 447, publishYear: 1977 },
    { isbn: '978-0316346622', title: 'Outliers: The Story of Success', authorId: 'author-3', publisherId: 'pub-1', categoryId: 'cat-nonfiction', price: 18.99, costPrice: 9.00, barcode: '9780316346622', language: 'English', pages: 320, publishYear: 2008 },
    { isbn: '978-0262033848', title: 'Introduction to Algorithms', publisherId: 'pub-2', categoryId: 'cat-academic', price: 89.99, costPrice: 45.00, barcode: '9780262033848', language: 'English', pages: 1312, publishYear: 2009, academicLevel: 'University' },
    { isbn: '978-0547928227', title: 'The Hobbit', publisherId: 'pub-1', categoryId: 'cat-fiction', price: 12.99, costPrice: 6.00, discount: 15, barcode: '9780547928227', language: 'English', pages: 300, publishYear: 1937 },
    { isbn: '978-1594632389', title: 'The Kite Runner', authorId: 'author-4', publisherId: 'pub-2', categoryId: 'cat-fiction', price: 15.99, costPrice: 7.50, barcode: '9781594632389', language: 'English', pages: 371, publishYear: 2003 },
    { isbn: '978-PK-UR-001', title: 'Peer-e-Kamil', authorId: 'author-6', publisherId: 'pub-4', categoryId: 'cat-fiction', price: 950, costPrice: 450, barcode: '978PKUR001', language: 'Urdu', pages: 400, publishYear: 2004 },
    { isbn: '978-PK-SC-001', title: 'Mathematics Grade 5', publisherId: 'pub-3', categoryId: 'cat-school', price: 450, costPrice: 200, barcode: '978PKSC001', language: 'English', pages: 200, publishYear: 2023, academicLevel: 'Grade 5', subject: 'Mathematics' },
    { isbn: '978-PK-SC-002', title: 'English Language Grade 5', publisherId: 'pub-3', categoryId: 'cat-school', price: 380, costPrice: 170, barcode: '978PKSC002', language: 'English', pages: 180, publishYear: 2023, academicLevel: 'Grade 5', subject: 'English' },
    { isbn: '978-PK-SC-003', title: 'Science Grade 5', publisherId: 'pub-3', categoryId: 'cat-school', price: 420, costPrice: 190, barcode: '978PKSC003', language: 'English', pages: 210, publishYear: 2023, academicLevel: 'Grade 5', subject: 'Science' },
    { isbn: '978-PK-SC-004', title: 'Urdu Grade 5', publisherId: 'pub-4', categoryId: 'cat-school', price: 350, costPrice: 150, barcode: '978PKSC004', language: 'Urdu', pages: 160, publishYear: 2023, academicLevel: 'Grade 5', subject: 'Urdu' },
    { isbn: '978-PK-SC-005', title: 'Pakistan Studies Grade 5', publisherId: 'pub-4', categoryId: 'cat-school', price: 320, costPrice: 140, barcode: '978PKSC005', language: 'Urdu', pages: 150, publishYear: 2023, academicLevel: 'Grade 5', subject: 'Pakistan Studies' },
    { isbn: '978-PK-CE-001', title: 'CSS Past Papers Collection', publisherId: 'pub-5', categoryId: 'cat-competitive', price: 2500, costPrice: 1200, barcode: '978PKCE001', language: 'English', pages: 800, publishYear: 2024, academicLevel: 'Competitive Exam' },
    { isbn: '978-PK-RL-001', title: 'Quran with Urdu Translation', publisherId: 'pub-4', categoryId: 'cat-religious', price: 1800, costPrice: 900, barcode: '978PKRL001', language: 'Arabic/Urdu', pages: 850, publishYear: 2020 },
    { isbn: '978-PK-CH-001', title: 'Adventures of Captain Pakistan', publisherId: 'pub-5', categoryId: 'cat-children', price: 350, costPrice: 150, barcode: '978PKCH001', language: 'English', pages: 48, publishYear: 2023 },
    { isbn: '978-8173711462', title: 'Wings of Fire', authorId: 'author-7', publisherId: 'pub-2', categoryId: 'cat-professional', price: 12.99, costPrice: 5.50, barcode: '9788173711462', language: 'English', pages: 180, publishYear: 1999 },
  ];

  for (const b of books) {
    await db.book.upsert({
      where: { isbn: b.isbn },
      update: {},
      create: b,
    });
  }

  console.log('✅ Created books');

  // Create inventory items
  const allStationery = await db.stationeryProduct.findMany();
  const allBooks = await db.book.findMany();
  const allWarehouses = await db.warehouse.findMany();

  // Add inventory for all products across warehouses
  for (const product of allStationery) {
    for (let wi = 0; wi < allWarehouses.length; wi++) {
      const wh = allWarehouses[wi];
      const qty = wi === 0 ? Math.floor(Math.random() * 80) + 20 : Math.floor(Math.random() * 40) + 10;
      const invId = `inv-st-${product.id}-${wh.code}`;
      await db.inventoryItem.upsert({
        where: { id: invId },
        update: {},
        create: {
          id: invId,
          stationeryId: product.id,
          warehouseId: wh.id,
          branchId: wh.branchId,
          quantity: qty,
          reorderLevel: 10,
          maxStockLevel: 200,
          costPrice: product.costPrice,
          sellingPrice: product.price,
        },
      });
    }
  }

  // Add book inventory
  for (const book of allBooks) {
    const wh = allWarehouses[0];
    const qty = Math.floor(Math.random() * 100) + 10;
    await db.inventoryItem.upsert({
      where: { id: `inv-bk-${book.id}` },
      update: {},
      create: {
        id: `inv-bk-${book.id}`,
        bookId: book.id,
        warehouseId: wh.id,
        branchId: wh.branchId,
        quantity: qty,
        reorderLevel: 10,
        maxStockLevel: 500,
        costPrice: book.costPrice,
        sellingPrice: book.price,
      },
    });
  }

  console.log('✅ Created inventory items');

  // Create customers
  const customers = [
    { id: 'dealer-1', name: 'City Books Distributors', email: 'orders@citybooks.com', phone: '042-35761234', type: 'dealer', totalSpent: 150000, outstanding: 25000, creditLimit: 100000 },
    { id: 'dealer-2', name: 'Academic Supplies Co.', email: 'bulk@academicsupplies.com', phone: '051-28761234', type: 'wholesale', totalSpent: 320000, outstanding: 45000, creditLimit: 200000 },
    { id: 'dealer-3', name: 'National Book Wholesalers', email: 'info@nbwholesale.com', phone: '021-35612345', type: 'distributor', totalSpent: 850000, outstanding: 120000, creditLimit: 500000 },
    { id: 'customer-1', name: 'Alice Johnson', email: 'alice@example.com', phone: '0300-1234567', type: 'retail', loyaltyPoints: 1250, totalSpent: 45000 },
    { id: 'customer-2', name: 'Bilal Ahmed', email: 'bilal@example.com', phone: '0321-2345678', type: 'retail', loyaltyPoints: 850, totalSpent: 28000 },
    { id: 'customer-3', name: 'Sara Malik', email: 'sara@example.com', phone: '0333-3456789', type: 'retail', loyaltyPoints: 2100, totalSpent: 72000 },
    { id: 'customer-4', name: 'Usman Tariq', email: 'usman@example.com', phone: '0345-4567890', type: 'retail', loyaltyPoints: 450, totalSpent: 15000 },
  ];

  for (const c of customers) {
    await db.customer.upsert({
      where: { id: c.id },
      update: {},
      create: c,
    });
  }

  console.log('✅ Created customers');

  // Create schools
  const school1 = await db.school.upsert({
    where: { id: 'school-1' },
    update: {},
    create: { id: 'school-1', name: 'Lahore Grammar School', address: '55 Main Boulevard, Gulberg', phone: '042-35761234', email: 'info@lgs.edu.pk', contactPerson: 'Mrs. Naveed Shah', academicSession: '2024-2025' },
  });
  const school2 = await db.school.upsert({
    where: { id: 'school-2' },
    update: {},
    create: { id: 'school-2', name: 'Beaconhouse School System', address: '32-Tipu Road, Rawalpindi', phone: '051-28761234', email: 'info@beaconhouse.edu.pk', contactPerson: 'Mr. Kamran Raza', academicSession: '2024-2025' },
  });
  const school3 = await db.school.upsert({
    where: { id: 'school-3' },
    update: {},
    create: { id: 'school-3', name: 'The City School', address: '12-Clifton Block 5, Karachi', phone: '021-35612345', email: 'info@cityschool.edu.pk', contactPerson: 'Ms. Ayesha Khan', academicSession: '2024-2025' },
  });

  console.log('✅ Created schools');

  // Create school contracts
  await db.schoolContract.upsert({
    where: { id: 'contract-1' },
    update: {},
    create: { id: 'contract-1', schoolId: school1.id, title: 'Annual Book Supply 2024-2025', academicSession: '2024-2025', totalValue: 2500000, status: 'active', startDate: new Date('2024-04-01'), endDate: new Date('2025-03-31') },
  });
  await db.schoolContract.upsert({
    where: { id: 'contract-2' },
    update: {},
    create: { id: 'contract-2', schoolId: school2.id, title: 'Book & Stationery Supply', academicSession: '2024-2025', totalValue: 1800000, status: 'active', startDate: new Date('2024-04-01'), endDate: new Date('2025-03-31') },
  });

  console.log('✅ Created school contracts');

  // Create academic packages
  const pkg1 = await db.academicPackage.upsert({
    where: { id: 'pkg-grade5-lgs' },
    update: {},
    create: { id: 'pkg-grade5-lgs', name: 'Grade 5 Package - LGS', schoolId: school1.id, grade: 'Grade 5', academicLevel: 'Primary', description: 'Complete book and stationery package for Grade 5', totalPrice: 3500, discount: 10 },
  });

  // Add items to package
  const mathBook = allBooks.find(b => b.subject === 'Mathematics' && b.academicLevel === 'Grade 5');
  const engBook = allBooks.find(b => b.subject === 'English' && b.academicLevel === 'Grade 5');
  const sciBook = allBooks.find(b => b.subject === 'Science' && b.academicLevel === 'Grade 5');
  const urduBook = allBooks.find(b => b.subject === 'Urdu' && b.academicLevel === 'Grade 5');
  const pstBook = allBooks.find(b => b.subject === 'Pakistan Studies' && b.academicLevel === 'Grade 5');
  const pencilBox = allStationery.find(s => s.name === 'School Pencil Box');
  const rulerSet = allStationery.find(s => s.name === 'Ruler Set (30cm)');
  const notebook = allStationery.find(s => s.name === 'Premium Notebook A5');

  if (mathBook) await db.academicPackageItem.upsert({ where: { id: 'pkgitem-1' }, update: {}, create: { id: 'pkgitem-1', packageId: pkg1.id, bookId: mathBook.id, quantity: 1, unitPrice: 450 } });
  if (engBook) await db.academicPackageItem.upsert({ where: { id: 'pkgitem-2' }, update: {}, create: { id: 'pkgitem-2', packageId: pkg1.id, bookId: engBook.id, quantity: 1, unitPrice: 380 } });
  if (sciBook) await db.academicPackageItem.upsert({ where: { id: 'pkgitem-3' }, update: {}, create: { id: 'pkgitem-3', packageId: pkg1.id, bookId: sciBook.id, quantity: 1, unitPrice: 420 } });
  if (urduBook) await db.academicPackageItem.upsert({ where: { id: 'pkgitem-4' }, update: {}, create: { id: 'pkgitem-4', packageId: pkg1.id, bookId: urduBook.id, quantity: 1, unitPrice: 350 } });
  if (pstBook) await db.academicPackageItem.upsert({ where: { id: 'pkgitem-5' }, update: {}, create: { id: 'pkgitem-5', packageId: pkg1.id, bookId: pstBook.id, quantity: 1, unitPrice: 320 } });
  if (pencilBox) await db.academicPackageItem.upsert({ where: { id: 'pkgitem-6' }, update: {}, create: { id: 'pkgitem-6', packageId: pkg1.id, stationeryId: pencilBox.id, quantity: 1, unitPrice: 7.99 } });
  if (rulerSet) await db.academicPackageItem.upsert({ where: { id: 'pkgitem-7' }, update: {}, create: { id: 'pkgitem-7', packageId: pkg1.id, stationeryId: rulerSet.id, quantity: 1, unitPrice: 3.49 } });
  if (notebook) await db.academicPackageItem.upsert({ where: { id: 'pkgitem-8' }, update: {}, create: { id: 'pkgitem-8', packageId: pkg1.id, stationeryId: notebook.id, quantity: 5, unitPrice: 12.99 } });

  console.log('✅ Created academic packages');

  // Create wholesale orders
  if (allBooks.length > 0 && allStationery.length > 0) {
    await db.wholesaleOrder.upsert({
      where: { orderNumber: 'WO-2501-0001' },
      update: {},
      create: {
        orderNumber: 'WO-2501-0001', customerId: 'dealer-1', status: 'delivered',
        subtotal: 45000, discount: 2500, tax: 0, total: 42500, paymentStatus: 'paid',
        deliveryAddress: '123 Distribution Way, Lahore',
        items: { create: [
          { bookId: allBooks[0].id, quantity: 20, unitPrice: 14.99, discount: 0, totalPrice: 299.80 },
          { stationeryId: allStationery[0].id, quantity: 10, unitPrice: 12.99, discount: 0, totalPrice: 129.90 },
        ] },
      },
    });

    await db.wholesaleOrder.upsert({
      where: { orderNumber: 'WO-2501-0002' },
      update: {},
      create: {
        orderNumber: 'WO-2501-0002', customerId: 'dealer-2', status: 'shipped',
        subtotal: 120000, discount: 6000, tax: 0, total: 114000, paymentStatus: 'partial',
        deliveryAddress: '456 Academic Ave, Islamabad',
        items: { create: [
          { bookId: allBooks[3].id, quantity: 10, unitPrice: 89.99, discount: 5, totalPrice: 854.91 },
          { stationeryId: allStationery[1].id, quantity: 30, unitPrice: 8.99, discount: 0, totalPrice: 269.70 },
        ] },
      },
    });

    await db.wholesaleOrder.upsert({
      where: { orderNumber: 'WO-2502-0001' },
      update: {},
      create: {
        orderNumber: 'WO-2502-0001', customerId: 'dealer-3', status: 'pending',
        subtotal: 250000, discount: 0, tax: 0, total: 250000, paymentStatus: 'unpaid',
        notes: 'Rush order - deliver by end of month',
        items: { create: [
          { bookId: allBooks[0].id, quantity: 50, unitPrice: 14.99, discount: 10, totalPrice: 674.55 },
          { bookId: allBooks[1].id, quantity: 30, unitPrice: 16.99, discount: 10, totalPrice: 458.73 },
          { stationeryId: allStationery[0].id, quantity: 100, unitPrice: 12.99, discount: 15, totalPrice: 1104.15 },
        ] },
      },
    });
  }

  console.log('✅ Created wholesale orders');

  // Create stock transfers
  await db.stockTransfer.upsert({
    where: { id: 'transfer-1' },
    update: {},
    create: { id: 'transfer-1', fromBranchId: branch1.id, toBranchId: branch2.id, items: JSON.stringify([{ productName: 'Premium Notebook A5', quantity: 20 }]), status: 'completed', notes: 'Monthly restock transfer' },
  });
  await db.stockTransfer.upsert({
    where: { id: 'transfer-2' },
    update: {},
    create: { id: 'transfer-2', fromBranchId: branch2.id, toBranchId: branch1.id, items: JSON.stringify([{ productName: 'Gel Pen Set', quantity: 15 }]), status: 'in-transit', notes: 'Urgent restock request' },
  });
  await db.stockTransfer.upsert({
    where: { id: 'transfer-3' },
    update: {},
    create: { id: 'transfer-3', fromBranchId: branch1.id, toBranchId: branch3.id, items: JSON.stringify([{ productName: 'Mathematics Grade 5', quantity: 50 }, { productName: 'English Language Grade 5', quantity: 50 }]), status: 'pending', notes: 'Islamabad branch school book restock' },
  });

  console.log('✅ Created stock transfers');

  // Create employees
  const employees = [
    { name: 'Ahmed Khan', email: 'ahmed@bookflow.pk', phone: '0300-1111111', department: 'Management', position: 'Branch Manager', salary: 120000, branchId: branch1.id, hireDate: new Date('2020-01-15') },
    { name: 'Fatima Rizvi', email: 'fatima@bookflow.pk', phone: '0321-2222222', department: 'Management', position: 'Branch Manager', salary: 115000, branchId: branch2.id, hireDate: new Date('2020-03-01') },
    { name: 'Hassan Ali', email: 'hassan@bookflow.pk', phone: '0333-3333333', department: 'Management', position: 'Branch Manager', salary: 110000, branchId: branch3.id, hireDate: new Date('2021-06-15') },
    { name: 'Amina Bibi', email: 'amina@bookflow.pk', phone: '0345-4444444', department: 'Sales', position: 'Sales Associate', salary: 55000, branchId: branch1.id, hireDate: new Date('2022-02-01') },
    { name: 'Zain Malik', email: 'zain@bookflow.pk', phone: '0300-5555555', department: 'Sales', position: 'Sales Associate', salary: 50000, branchId: branch2.id, hireDate: new Date('2022-08-15') },
    { name: 'Maryam Nawaz', email: 'maryam@bookflow.pk', phone: '0321-6666666', department: 'Finance', position: 'Accountant', salary: 85000, hireDate: new Date('2021-01-10') },
    { name: 'Imran Siddiqui', email: 'imran@bookflow.pk', phone: '0333-7777777', department: 'Warehouse', position: 'Warehouse Manager', salary: 65000, branchId: branch1.id, hireDate: new Date('2020-09-20') },
    { name: 'Sana Javed', email: 'sana@bookflow.pk', phone: '0345-8888888', department: 'Marketing', position: 'Marketing Coordinator', salary: 70000, hireDate: new Date('2023-01-05') },
  ];

  for (const emp of employees) {
    await db.employee.upsert({
      where: { email: emp.email },
      update: {},
      create: emp,
    });
  }

  console.log('✅ Created employees');

  // Create finance accounts
  const accounts = [
    { code: '1000', name: 'Cash', type: 'asset', balance: 500000 },
    { code: '1100', name: 'Bank Account', type: 'asset', balance: 2500000 },
    { code: '1200', name: 'Accounts Receivable', type: 'asset', balance: 190000 },
    { code: '1300', name: 'Inventory', type: 'asset', balance: 1800000 },
    { code: '2000', name: 'Accounts Payable', type: 'liability', balance: 350000 },
    { code: '2100', name: 'Tax Payable', type: 'liability', balance: 45000 },
    { code: '3000', name: 'Owner Equity', type: 'equity', balance: 5000000 },
    { code: '4000', name: 'Sales Revenue', type: 'revenue', balance: 3200000 },
    { code: '4100', name: 'Wholesale Revenue', type: 'revenue', balance: 1800000 },
    { code: '5000', name: 'Cost of Goods Sold', type: 'expense', balance: 1500000 },
    { code: '5100', name: 'Rent Expense', type: 'expense', balance: 360000 },
    { code: '5200', name: 'Salaries Expense', type: 'expense', balance: 840000 },
    { code: '5300', name: 'Utilities Expense', type: 'expense', balance: 72000 },
  ];

  for (const acc of accounts) {
    await db.account.upsert({
      where: { code: acc.code },
      update: {},
      create: acc,
    });
  }

  console.log('✅ Created finance accounts');

  // Create expenses
  const expenses = [
    { category: 'Rent', amount: 30000, date: new Date('2024-12-01'), description: 'Monthly rent - Downtown Store', paidBy: 'Finance Department', status: 'paid' },
    { category: 'Utilities', amount: 8500, date: new Date('2024-12-05'), description: 'Electricity bill - December', paidBy: 'Finance Department', status: 'paid' },
    { category: 'Marketing', amount: 15000, date: new Date('2024-12-10'), description: 'Social media campaign', paidBy: 'Marketing Department', status: 'approved' },
    { category: 'Supplies', amount: 5000, date: new Date('2024-12-12'), description: 'Office supplies purchase', paidBy: 'Admin', status: 'pending' },
    { category: 'Maintenance', amount: 12000, date: new Date('2024-12-15'), description: 'AC repair - Mall branch', paidBy: 'Facilities', status: 'paid' },
  ];

  for (const exp of expenses) {
    await db.expense.create({ data: exp });
  }

  console.log('✅ Created expenses');

  // Create campaigns
  const campaigns = [
    { name: 'Back to School 2024', type: 'whatsapp', target: 'All Schools', message: 'Get ready for the new academic year! Special discounts on school book packages and stationery kits.', status: 'completed', sentCount: 500, responseCount: 120, sentAt: new Date('2024-03-15') },
    { name: 'Holiday Sale', type: 'email', target: 'Retail Customers', message: 'Holiday season special! Up to 30% off on fiction and non-fiction bestsellers.', status: 'sent', sentCount: 2500, responseCount: 340, sentAt: new Date('2024-12-20') },
    { name: 'New Arrivals Alert', type: 'sms', target: 'Loyalty Members', message: 'New arrivals just in! Visit BookFlow OS for the latest titles.', status: 'draft', sentCount: 0, responseCount: 0 },
  ];

  for (const camp of campaigns) {
    await db.campaign.create({ data: camp });
  }

  console.log('✅ Created campaigns');

  // Create loyalty tiers
  const tiers = [
    { name: 'Bronze', minPoints: 0, maxPoints: 499, discount: 5, benefits: '5% discount, Birthday special' },
    { name: 'Silver', minPoints: 500, maxPoints: 1999, discount: 10, benefits: '10% discount, Free delivery, Early access' },
    { name: 'Gold', minPoints: 2000, maxPoints: 4999, discount: 15, benefits: '15% discount, Free delivery, Priority support' },
    { name: 'Platinum', minPoints: 5000, maxPoints: null, discount: 20, benefits: '20% discount, Free delivery, VIP events, Personal shopper' },
  ];

  for (const tier of tiers) {
    await db.loyaltyTier.upsert({
      where: { id: `tier-${tier.name.toLowerCase()}` },
      update: {},
      create: { id: `tier-${tier.name.toLowerCase()}`, ...tier },
    });
  }

  console.log('✅ Created loyalty tiers');

  // Create manuscripts
  const manuscripts = [
    { title: 'Shadows of Lahore', author: 'Zara Sheikh', status: 'submitted', submittedAt: new Date('2024-11-15'), notes: 'Historical fiction set in Mughal era' },
    { title: 'Quantum Computing for Beginners', author: 'Dr. Ali Raza', status: 'reviewed', submittedAt: new Date('2024-10-01'), reviewedAt: new Date('2024-11-20'), notes: 'Academic manuscript' },
    { title: 'Recipes of the Indus Valley', author: 'Chef Nadia', status: 'approved', submittedAt: new Date('2024-08-01'), reviewedAt: new Date('2024-09-15'), notes: 'Cookbook with traditional recipes' },
  ];

  for (const ms of manuscripts) {
    await db.manuscript.create({ data: ms });
  }

  console.log('✅ Created manuscripts');

  // Create online orders
  const onlineOrders = [
    { orderNumber: 'ON-2401-001', customerName: 'Ali Hussain', customerEmail: 'ali@example.com', customerPhone: '0300-9999999', items: JSON.stringify([{ name: 'Harry Potter', qty: 1, price: 14.99 }, { name: 'Notebook A5', qty: 2, price: 12.99 }]), total: 40.97, status: 'delivered', deliveryMethod: 'home', deliveryAddress: '45 Gulberg III, Lahore' },
    { orderNumber: 'ON-2401-002', customerName: 'Sara Khan', customerEmail: 'sara.k@example.com', customerPhone: '0321-8888888', items: JSON.stringify([{ name: 'The Kite Runner', qty: 1, price: 15.99 }]), total: 15.99, status: 'shipped', deliveryMethod: 'home', deliveryAddress: '12 F-7 Markaz, Islamabad' },
    { orderNumber: 'ON-2401-003', customerName: 'Usman Ali', customerEmail: 'usman.a@example.com', customerPhone: '0333-7777777', items: JSON.stringify([{ name: 'Mathematics Grade 5', qty: 1, price: 450 }, { name: 'Science Grade 5', qty: 1, price: 420 }]), total: 870, status: 'confirmed', deliveryMethod: 'pickup' },
  ];

  for (const order of onlineOrders) {
    await db.onlineOrder.upsert({
      where: { orderNumber: order.orderNumber },
      update: {},
      create: order,
    });
  }

  console.log('✅ Created online orders');

  // Create some sales
  const salesData = [
    { invoiceNumber: 'INV-2024-001', customerId: 'customer-1', branchId: branch1.id, subtotal: 42.97, discount: 2, tax: 0, total: 40.97, paymentMethod: 'card', paymentStatus: 'paid', saleType: 'retail', items: [{ bookId: allBooks[0]?.id, quantity: 1, unitPrice: 14.99, discount: 0, totalPrice: 14.99 }, { stationeryId: allStationery[0]?.id, quantity: 2, unitPrice: 12.99, discount: 0, totalPrice: 25.98 }] },
    { invoiceNumber: 'INV-2024-002', customerId: 'customer-3', branchId: branch2.id, subtotal: 89.99, discount: 0, tax: 0, total: 89.99, paymentMethod: 'cash', paymentStatus: 'paid', saleType: 'retail', items: [{ bookId: allBooks[3]?.id, quantity: 1, unitPrice: 89.99, discount: 0, totalPrice: 89.99 }] },
    { invoiceNumber: 'INV-2024-003', customerId: 'customer-2', branchId: branch1.id, subtotal: 35.97, discount: 5, tax: 0, total: 30.97, paymentMethod: 'wallet', paymentStatus: 'paid', saleType: 'retail', items: [{ bookId: allBooks[4]?.id, quantity: 1, unitPrice: 12.99, discount: 0, totalPrice: 12.99 }, { bookId: allBooks[5]?.id, quantity: 1, unitPrice: 15.99, discount: 0, totalPrice: 15.99 }] },
  ];

  for (const sale of salesData) {
    await db.sale.upsert({
      where: { invoiceNumber: sale.invoiceNumber },
      update: {},
      create: {
        invoiceNumber: sale.invoiceNumber,
        customerId: sale.customerId,
        branchId: sale.branchId,
        subtotal: sale.subtotal,
        discount: sale.discount,
        tax: sale.tax,
        total: sale.total,
        paymentMethod: sale.paymentMethod,
        paymentStatus: sale.paymentStatus,
        saleType: sale.saleType,
        items: { create: sale.items.filter(item => item.bookId || item.stationeryId) },
      },
    });
  }

  console.log('✅ Created sales');

  // Create purchase orders
  await db.purchaseOrder.upsert({
    where: { orderNumber: 'PO-2024-001' },
    update: {},
    create: { orderNumber: 'PO-2024-001', publisherId: 'pub-3', supplier: 'OUP Pakistan', status: 'pending', totalAmount: 250000, notes: 'Annual school book order for 2025 session' },
  });
  await db.purchaseOrder.upsert({
    where: { orderNumber: 'PO-2024-002' },
    update: {},
    create: { orderNumber: 'PO-2024-002', publisherId: 'pub-1', supplier: 'Penguin Random House', status: 'ordered', totalAmount: 85000, notes: 'Fiction bestsellers restock' },
  });

  console.log('✅ Created purchase orders');

  console.log('🎉 Seeding complete!');
}

seed()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
