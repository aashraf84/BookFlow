import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TENANT_ID = 'cmqcfol480000rgqrdgj3mgfr' // ApexFlow HQ

async function main() {
  console.log('🌱 Seeding demo book data...')

  // ─── 1. Branches ─────────────────────────────────────────
  console.log('📦 Creating branches...')
  const mainBranch = await prisma.branch.create({
    data: {
      tenantId: TENANT_ID,
      name: 'Main Bookstore',
      code: 'MAIN',
      address: '123 Book Street, Lahore',
      phone: '+92-42-35761234',
      email: 'main@apexflow.cloud',
      manager: 'Ahmed Khan',
      isActive: true,
    },
  })

  const gulbergBranch = await prisma.branch.create({
    data: {
      tenantId: TENANT_ID,
      name: 'Gulberg Outlet',
      code: 'GLBRG',
      address: '45 Gulberg III, Lahore',
      phone: '+92-42-35711111',
      email: 'gulberg@apexflow.cloud',
      manager: 'Sara Ali',
      isActive: true,
    },
  })

  const islamabadBranch = await prisma.branch.create({
    data: {
      tenantId: TENANT_ID,
      name: 'Islamabad Flagship',
      code: 'ISB',
      address: 'F-7 Markaz, Islamabad',
      phone: '+92-51-2654321',
      email: 'isb@apexflow.cloud',
      manager: 'Usman Malik',
      isActive: true,
    },
  })

  // ─── 2. Warehouse ────────────────────────────────────────
  console.log('🏗️ Creating warehouse...')
  const mainWarehouse = await prisma.warehouse.create({
    data: {
      tenantId: TENANT_ID,
      name: 'Central Warehouse',
      code: 'CWH',
      address: 'Industrial Area, Kot Lakhpat, Lahore',
      branchId: mainBranch.id,
      isActive: true,
    },
  })

  // ─── 3. Book Categories ──────────────────────────────────
  console.log('📂 Creating book categories...')
  const categories = await Promise.all([
    prisma.bookCategory.create({ data: { tenantId: TENANT_ID, name: 'Fiction', type: 'fiction' } }),
    prisma.bookCategory.create({ data: { tenantId: TENANT_ID, name: 'Non-Fiction', type: 'non-fiction' } }),
    prisma.bookCategory.create({ data: { tenantId: TENANT_ID, name: 'Academic - School', type: 'school' } }),
    prisma.bookCategory.create({ data: { tenantId: TENANT_ID, name: 'Academic - College', type: 'college' } }),
    prisma.bookCategory.create({ data: { tenantId: TENANT_ID, name: 'Academic - University', type: 'university' } }),
    prisma.bookCategory.create({ data: { tenantId: TENANT_ID, name: 'Religious & Islamic', type: 'religious' } }),
    prisma.bookCategory.create({ data: { tenantId: TENANT_ID, name: 'Competitive Exams', type: 'competitive' } }),
    prisma.bookCategory.create({ data: { tenantId: TENANT_ID, name: 'Children', type: 'children' } }),
    prisma.bookCategory.create({ data: { tenantId: TENANT_ID, name: 'Professional & Business', type: 'professional' } }),
    prisma.bookCategory.create({ data: { tenantId: TENANT_ID, name: 'Science & Technology', type: 'university' } }),
  ])

  const [fiction, nonFiction, school, college, university, religious, competitive, children, professional, science] = categories

  // ─── 4. Authors ──────────────────────────────────────────
  console.log('✍️ Creating authors...')
  const authors = await Promise.all([
    prisma.author.create({ data: { tenantId: TENANT_ID, name: 'Khalid Hosseini', nationality: 'Afghan-American' } }),
    prisma.author.create({ data: { tenantId: TENANT_ID, name: 'Mohsin Hamid', nationality: 'Pakistani' } }),
    prisma.author.create({ data: { tenantId: TENANT_ID, name: 'Bapsi Sidhwa', nationality: 'Pakistani' } }),
    prisma.author.create({ data: { tenantId: TENANT_ID, name: 'Kamila Shamsie', nationality: 'Pakistani' } }),
    prisma.author.create({ data: { tenantId: TENANT_ID, name: 'Maulana Jalaluddin Rumi', nationality: 'Persian' } }),
    prisma.author.create({ data: { tenantId: TENANT_ID, name: 'Muhammad Iqbal', nationality: 'Pakistani' } }),
    prisma.author.create({ data: { tenantId: TENANT_ID, name: 'Abul A\'la Maududi', nationality: 'Pakistani' } }),
    prisma.author.create({ data: { tenantId: TENANT_ID, name: 'Paulo Coelho', nationality: 'Brazilian' } }),
    prisma.author.create({ data: { tenantId: TENANT_ID, name: 'George Orwell', nationality: 'British' } }),
    prisma.author.create({ data: { tenantId: TENANT_ID, name: 'J.K. Rowling', nationality: 'British' } }),
    prisma.author.create({ data: { tenantId: TENANT_ID, name: 'Stephen Hawking', nationality: 'British' } }),
    prisma.author.create({ data: { tenantId: TENANT_ID, name: 'Yuval Noah Harari', nationality: 'Israeli' } }),
    prisma.author.create({ data: { tenantId: TENANT_ID, name: 'Simon Sinek', nationality: 'British-American' } }),
    prisma.author.create({ data: { tenantId: TENANT_ID, name: 'Robert Kiyosaki', nationality: 'American' } }),
    prisma.author.create({ data: { tenantId: TENANT_ID, name: 'Napoleon Hill', nationality: 'American' } }),
    prisma.author.create({ data: { tenantId: TENANT_ID, name: 'Dan Brown', nationality: 'American' } }),
    prisma.author.create({ data: { tenantId: TENANT_ID, name: 'Agatha Christie', nationality: 'British' } }),
    prisma.author.create({ data: { tenantId: TENANT_ID, name: 'Tariq Jameel', nationality: 'Pakistani' } }),
    prisma.author.create({ data: { tenantId: TENANT_ID, name: 'Mustansar Hussain Tarar', nationality: 'Pakistani' } }),
    prisma.author.create({ data: { tenantId: TENANT_ID, name: 'Intizar Hussain', nationality: 'Pakistani' } }),
  ])

  const [khalidHosseini, mohsinHamid, bapsiSidhwa, kamilaShamsie, rumi, iqbal, maududi, coelho, orwell, rowling, hawking, harari, sinek, kiyosaki, hill, brown, christie, tariqJameel, tarar, intizarHussain] = authors

  // ─── 5. Publishers ───────────────────────────────────────
  console.log('🏢 Creating publishers...')
  const publishers = await Promise.all([
    prisma.publisher.create({ data: { tenantId: TENANT_ID, name: 'Oxford University Press Pakistan', contact: 'OUP Pakistan', email: 'info@oup.com.pk', phone: '+92-21-35612345', address: 'Karachi' } }),
    prisma.publisher.create({ data: { tenantId: TENANT_ID, name: 'Sang-e-Meel Publications', contact: 'Sang-e-Meel', email: 'info@sangeemeel.com', phone: '+92-42-36361234', address: 'Lahore' } }),
    prisma.publisher.create({ data: { tenantId: TENANT_ID, name: 'Ferozsons', contact: 'Ferozsons Ltd', email: 'info@ferozsons.com', phone: '+92-42-36312345', address: 'Lahore' } }),
    prisma.publisher.create({ data: { tenantId: TENANT_ID, name: 'Penguin Random House', contact: 'PRH', email: 'info@penguinrandomhouse.com', address: 'New York' } }),
    prisma.publisher.create({ data: { tenantId: TENANT_ID, name: 'HarperCollins', contact: 'HC', email: 'info@harpercollins.com', address: 'New York' } }),
    prisma.publisher.create({ data: { tenantId: TENANT_ID, name: 'Dar-us-Salam Publications', contact: 'Dar-us-Salam', email: 'info@dar-us-salam.com', phone: '+92-51-4411122', address: 'Riyadh / Lahore' } }),
    prisma.publisher.create({ data: { tenantId: TENANT_ID, name: 'Ilmo Irfan Publishers', contact: 'Ilmo Irfan', email: 'info@ilmoirfan.com', phone: '+92-42-37241234', address: 'Lahore' } }),
    prisma.publisher.create({ data: { tenantId: TENANT_ID, name: 'Caravan Book House', contact: 'Caravan', email: 'info@caravanbooks.com', address: 'Lahore' } }),
  ])

  const [oup, sangeemeel, ferozsons, penguin, harper, darussalam, ilmoIrfan, caravan] = publishers

  // ─── 6. Books ────────────────────────────────────────────
  console.log('📚 Creating books...')
  const booksData = [
    // Fiction
    { title: 'The Kite Runner', isbn: '978-1594480003', authorId: khalidHosseini.id, publisherId: penguin.id, categoryId: fiction.id, price: 1295, costPrice: 750, pages: 371, publishYear: 2003, language: 'English', edition: '10th Anniversary', description: 'A powerful story of friendship, betrayal, and redemption set in Afghanistan.' },
    { title: 'A Thousand Splendid Suns', isbn: '978-1594489501', authorId: khalidHosseini.id, publisherId: penguin.id, categoryId: fiction.id, price: 1395, costPrice: 800, pages: 372, publishYear: 2007, language: 'English', description: 'An unforgettable portrait of a wounded country and a deeply moving story of family and friendship.' },
    { title: 'Exit West', isbn: '978-0735212176', authorId: mohsinHamid.id, publisherId: penguin.id, categoryId: fiction.id, price: 1195, costPrice: 680, pages: 231, publishYear: 2017, language: 'English', description: 'A novel about migration, love, and the borders that separate us.' },
    { title: 'Home Fire', isbn: '978-0525521142', authorId: kamilaShamsie.id, publisherId: penguin.id, categoryId: fiction.id, price: 1095, costPrice: 620, pages: 272, publishYear: 2017, language: 'English', description: 'A contemporary reimagining of Antigone set in the context of British Muslim identity.' },
    { title: 'The Alchemist', isbn: '978-0062315007', authorId: coelho.id, publisherId: harper.id, categoryId: fiction.id, price: 895, costPrice: 480, pages: 197, publishYear: 1988, language: 'English', description: 'A mystical story about following your dreams and listening to your heart.' },
    { title: '1984', isbn: '978-0451524935', authorId: orwell.id, publisherId: penguin.id, categoryId: fiction.id, price: 695, costPrice: 350, pages: 328, publishYear: 1949, language: 'English', description: 'A dystopian masterpiece about totalitarianism and surveillance.' },
    { title: 'Harry Potter and the Philosopher\'s Stone', isbn: '978-0747532699', authorId: rowling.id, publisherId: penguin.id, categoryId: fiction.id, price: 1495, costPrice: 850, pages: 309, publishYear: 1997, language: 'English', description: 'The beginning of the magical journey of a young wizard.' },
    { title: 'The Da Vinci Code', isbn: '978-0307474278', authorId: brown.id, publisherId: penguin.id, categoryId: fiction.id, price: 995, costPrice: 550, pages: 489, publishYear: 2003, language: 'English', description: 'A gripping thriller that explores hidden codes in art and history.' },
    { title: 'Murder on the Orient Express', isbn: '978-0062693662', authorId: christie.id, publisherId: harper.id, categoryId: fiction.id, price: 795, costPrice: 420, pages: 274, publishYear: 1934, language: 'English', description: 'The legendary detective Hercule Poirot solves a murder on a luxury train.' },

    // Non-Fiction
    { title: 'Sapiens: A Brief History of Humankind', isbn: '978-0062316097', authorId: harari.id, publisherId: harper.id, categoryId: nonFiction.id, price: 1695, costPrice: 950, pages: 443, publishYear: 2011, language: 'English', description: 'An exploration of how Homo sapiens came to dominate the world.' },
    { title: 'A Brief History of Time', isbn: '978-0553380163', authorId: hawking.id, publisherId: penguin.id, categoryId: nonFiction.id, price: 1195, costPrice: 680, pages: 212, publishYear: 1988, language: 'English', description: 'A landmark volume in science writing exploring time and the universe.' },
    { title: 'Start with Why', isbn: '978-1591846444', authorId: sinek.id, publisherId: penguin.id, categoryId: professional.id, price: 1495, costPrice: 820, pages: 246, publishYear: 2009, language: 'English', description: 'How great leaders inspire action by starting with the question "Why?"' },
    { title: 'Rich Dad Poor Dad', isbn: '978-1612680194', authorId: kiyosaki.id, publisherId: penguin.id, categoryId: professional.id, price: 895, costPrice: 480, pages: 336, publishYear: 1997, language: 'English', description: 'What the rich teach their kids about money that the poor do not.' },
    { title: 'Think and Grow Rich', isbn: '978-1585424337', authorId: hill.id, publisherId: penguin.id, categoryId: professional.id, price: 695, costPrice: 340, pages: 320, publishYear: 1937, language: 'English', description: 'The classic guide to personal achievement and wealth building.' },

    // Religious
    { title: 'Masnavi Ma\'navi (Selections)', isbn: '978-0199549913', authorId: rumi.id, publisherId: oup.id, categoryId: religious.id, price: 1895, costPrice: 1100, pages: 512, publishYear: 2008, language: 'English/Persian', description: 'Selections from Rumi\'s spiritual masterpiece of Sufi poetry.' },
    { title: 'Bang-e-Dra', isbn: '978-9693512345', authorId: iqbal.id, publisherId: sangeemeel.id, categoryId: religious.id, price: 595, costPrice: 280, pages: 384, publishYear: 1924, language: 'Urdu', description: 'The Call of the Marching Bell - Allama Iqbal\'s first philosophical poetry collection.' },
    { title: 'Towards Understanding Islam', isbn: '978-0860371743', authorId: maududi.id, publisherId: darussalam.id, categoryId: religious.id, price: 495, costPrice: 220, pages: 174, publishYear: 1960, language: 'English', description: 'A comprehensive introduction to the faith and practice of Islam.' },
    { title: 'Reconstruction of Religious Thought in Islam', isbn: '978-9693515674', authorId: iqbal.id, publisherId: sangeemeel.id, categoryId: religious.id, price: 795, costPrice: 400, pages: 234, publishYear: 1930, language: 'English', description: 'Iqbal\'s philosophical lectures on the future of Islam as a living faith.' },

    // Children
    { title: 'Harry Potter and the Chamber of Secrets', isbn: '978-0747538493', authorId: rowling.id, publisherId: penguin.id, categoryId: children.id, price: 1295, costPrice: 720, pages: 341, publishYear: 1998, language: 'English', description: 'The second year at Hogwarts brings mystery and danger.' },
    { title: 'Stories of the Prophets', isbn: '978-9960897123', authorId: tariqJameel.id, publisherId: darussalam.id, categoryId: children.id, price: 395, costPrice: 180, pages: 128, publishYear: 2015, language: 'English', description: 'Beautiful retellings of the stories of prophets for young readers.' },

    // Pakistani Literature
    { title: 'The Crow Eaters', isbn: '978-0140120470', authorId: bapsiSidhwa.id, publisherId: penguin.id, categoryId: fiction.id, price: 895, costPrice: 480, pages: 246, publishYear: 1978, language: 'English', description: 'A hilarious and touching story of a Parsee family in Pakistan.' },
    { title: 'Rakaposhi', isbn: '978-9693518903', authorId: tarar.id, publisherId: sangeemeel.id, categoryId: fiction.id, price: 695, costPrice: 340, pages: 288, publishYear: 1990, language: 'Urdu', description: 'A travelogue and novel set against the stunning backdrop of Rakaposhi mountain.' },
    { title: 'Chandni', isbn: '978-9693521101', authorId: intizarHussain.id, publisherId: sangeemeel.id, categoryId: fiction.id, price: 495, costPrice: 220, pages: 196, publishYear: 1980, language: 'Urdu', description: 'A haunting tale of migration and loss set during Partition.' },

    // Academic - School
    { title: 'Oxford Modern English Book 5', isbn: '978-0195979123', publisherId: oup.id, categoryId: school.id, price: 495, costPrice: 260, pages: 144, publishYear: 2020, language: 'English', academicLevel: 'Primary', subject: 'English' },
    { title: 'Oxford Maths Wise Book 8', isbn: '978-0195979456', publisherId: oup.id, categoryId: school.id, price: 545, costPrice: 290, pages: 168, publishYear: 2021, language: 'English', academicLevel: 'Middle', subject: 'Mathematics' },
    { title: 'Pakistan Studies Grade 9', isbn: '978-9693519122', publisherId: ferozsons.id, categoryId: school.id, price: 395, costPrice: 190, pages: 128, publishYear: 2022, language: 'English', academicLevel: 'Secondary', subject: 'Pakistan Studies' },

    // Academic - College
    { title: 'Intermediate Physics Part 1', isbn: '978-9693519456', publisherId: ilmoIrfan.id, categoryId: college.id, price: 695, costPrice: 370, pages: 256, publishYear: 2023, language: 'English', academicLevel: 'Intermediate', subject: 'Physics' },
    { title: 'Intermediate Chemistry Part 2', isbn: '978-9693519789', publisherId: caravan.id, categoryId: college.id, price: 645, costPrice: 340, pages: 224, publishYear: 2023, language: 'English', academicLevel: 'Intermediate', subject: 'Chemistry' },

    // Academic - University
    { title: 'Introduction to Algorithms', isbn: '978-0262033848', publisherId: penguin.id, categoryId: university.id, price: 4950, costPrice: 2800, pages: 1312, publishYear: 2009, language: 'English', academicLevel: 'Undergraduate', subject: 'Computer Science' },
    { title: 'Principles of Economics', isbn: '978-1305585126', publisherId: penguin.id, categoryId: university.id, price: 3450, costPrice: 1950, pages: 856, publishYear: 2017, language: 'English', academicLevel: 'Undergraduate', subject: 'Economics' },

    // Competitive Exams
    { title: 'CSS Compulsory Subjects Guide', isbn: '978-9693520234', publisherId: caravan.id, categoryId: competitive.id, price: 1595, costPrice: 870, pages: 640, publishYear: 2024, language: 'English', description: 'Comprehensive guide for CSS Central Superior Services exam preparation.' },
    { title: 'FPSC General Knowledge MCQs', isbn: '978-9693520567', publisherId: caravan.id, categoryId: competitive.id, price: 895, costPrice: 480, pages: 384, publishYear: 2024, language: 'English', description: 'Essential MCQ collection for federal public service commission exams.' },

    // Science & Technology
    { title: 'Python Crash Course', isbn: '978-1593279288', publisherId: penguin.id, categoryId: science.id, price: 2495, costPrice: 1400, pages: 544, publishYear: 2019, language: 'English', description: 'A hands-on, project-based introduction to programming in Python.' },
    { title: 'Clean Code', isbn: '978-0132350884', publisherId: penguin.id, categoryId: science.id, price: 2195, costPrice: 1200, pages: 464, publishYear: 2008, language: 'English', description: 'A handbook of agile software craftsmanship by Robert C. Martin.' },
  ]

  const books = []
  for (const book of booksData) {
    const created = await prisma.book.create({
      data: {
        tenantId: TENANT_ID,
        ...book,
        discount: 0,
        isActive: true,
      },
    })
    books.push(created)
  }
  console.log(`📚 Created ${books.length} books`)

  // ─── 7. Stationery Categories & Products ─────────────────
  console.log('✏️ Creating stationery...')
  const penCat = await prisma.stationeryCategory.create({ data: { tenantId: TENANT_ID, name: 'Pens & Markers', type: 'pens' } })
  const notebookCat = await prisma.stationeryCategory.create({ data: { tenantId: TENANT_ID, name: 'Notebooks & Registers', type: 'notebooks' } })
  const artCat = await prisma.stationeryCategory.create({ data: { tenantId: TENANT_ID, name: 'Art Supplies', type: 'art' } })
  const schoolSupCat = await prisma.stationeryCategory.create({ data: { tenantId: TENANT_ID, name: 'School Supplies', type: 'school' } })

  const stationeryProducts = [
    { name: 'Dollar Premium Ballpoint Pen', sku: 'PEN-001', categoryId: penCat.id, brand: 'Dollar', price: 45, costPrice: 22, unit: 'piece' },
    { name: 'Pilot G2 Gel Pen 0.7mm', sku: 'PEN-002', categoryId: penCat.id, brand: 'Pilot', price: 195, costPrice: 110, unit: 'piece' },
    { name: 'Sharpie Permanent Marker', sku: 'PEN-003', categoryId: penCat.id, brand: 'Sharpie', price: 250, costPrice: 140, unit: 'piece' },
    { name: 'Dollar 4-in-1 Color Pen', sku: 'PEN-004', categoryId: penCat.id, brand: 'Dollar', price: 85, costPrice: 42, unit: 'piece' },
    { name: 'Standard Notebook 200 Pages', sku: 'NBK-001', categoryId: notebookCat.id, brand: 'Nokia', price: 120, costPrice: 60, unit: 'piece' },
    { name: 'Hardcover Journal A5', sku: 'NBK-002', categoryId: notebookCat.id, brand: 'Moleskine', price: 895, costPrice: 480, unit: 'piece' },
    { name: 'Register 500 Pages', sku: 'NBK-003', categoryId: notebookCat.id, price: 250, costPrice: 130, unit: 'piece' },
    { name: 'Faber-Castell Watercolor Set 12pc', sku: 'ART-001', categoryId: artCat.id, brand: 'Faber-Castell', price: 695, costPrice: 380, unit: 'piece' },
    { name: 'Crayola Crayons 24 Pack', sku: 'ART-002', categoryId: artCat.id, brand: 'Crayola', price: 395, costPrice: 210, unit: 'piece' },
    { name: 'Geometry Box 10pc Set', sku: 'SCH-001', categoryId: schoolSupCat.id, brand: 'Maped', price: 295, costPrice: 155, unit: 'piece' },
    { name: 'School Bag 25L', sku: 'SCH-002', categoryId: schoolSupCat.id, price: 1495, costPrice: 780, unit: 'piece' },
    { name: 'Pencil Box Large', sku: 'SCH-003', categoryId: schoolSupCat.id, price: 195, costPrice: 95, unit: 'piece' },
  ]

  for (const product of stationeryProducts) {
    await prisma.stationeryProduct.create({
      data: {
        tenantId: TENANT_ID,
        ...product,
        discount: 0,
        isActive: true,
        minOrderQty: 1,
      },
    })
  }
  console.log(`✏️ Created ${stationeryProducts.length} stationery products`)

  // ─── 8. Inventory ────────────────────────────────────────
  console.log('📦 Creating inventory...')
  for (let i = 0; i < books.length; i++) {
    const book = books[i]
    const qty = Math.floor(Math.random() * 80) + 20 // 20-100
    await prisma.inventoryItem.create({
      data: {
        tenantId: TENANT_ID,
        warehouseId: mainWarehouse.id,
        branchId: mainBranch.id,
        bookId: book.id,
        quantity: qty,
        reorderLevel: 10,
        maxStockLevel: 200,
        costPrice: book.costPrice,
        sellingPrice: book.price,
      },
    })
  }
  console.log('📦 Created inventory for all books')

  // ─── 9. Customers ────────────────────────────────────────
  console.log('👥 Creating customers...')
  const customers = [
    { name: 'Ali Raza', email: 'ali.raza@email.com', phone: '0300-1234567', type: 'retail', totalSpent: 4500 },
    { name: 'Fatima Noor', email: 'fatima.noor@email.com', phone: '0321-2345678', type: 'retail', totalSpent: 8200 },
    { name: 'Hassan Ahmed', email: 'hassan.ahmed@email.com', phone: '0333-3456789', type: 'wholesale', totalSpent: 45000, creditLimit: 50000 },
    { name: 'Zainab Khan', email: 'zainab.khan@email.com', phone: '0345-4567890', type: 'retail', totalSpent: 3100 },
    { name: 'Beaconhouse School System', email: 'procurement@beaconhouse.edu.pk', phone: '042-35711111', type: 'school', totalSpent: 125000, creditLimit: 200000 },
    { name: 'Lahore Books Distributors', email: 'orders@lahorebooks.pk', phone: '042-37241234', type: 'distributor', totalSpent: 580000, creditLimit: 500000 },
    { name: 'Omar Shehzad', email: 'omar.s@email.com', phone: '0312-5678901', type: 'retail', totalSpent: 12700 },
    { name: 'Ayesha Siddiqui', email: 'ayesha.s@email.com', phone: '0334-6789012', type: 'retail', totalSpent: 5600 },
    { name: 'City School Network', email: 'books@cityschool.edu.pk', phone: '051-2871234', type: 'school', totalSpent: 89000, creditLimit: 150000 },
    { name: 'Readers Club', email: 'info@readersclub.pk', phone: '042-36312345', type: 'dealer', totalSpent: 210000, creditLimit: 300000 },
  ]

  for (const cust of customers) {
    await prisma.customer.create({
      data: {
        tenantId: TENANT_ID,
        ...cust,
        loyaltyPoints: Math.floor(cust.totalSpent / 100),
        isActive: true,
        outstanding: 0,
      },
    })
  }
  console.log(`👥 Created ${customers.length} customers`)

  // ─── 10. Employees ───────────────────────────────────────
  console.log('👔 Creating employees...')
  const employees = [
    { name: 'Ahmed Khan', email: 'ahmed.khan@apexflow.cloud', department: 'Sales', position: 'Store Manager', salary: 85000, branchId: mainBranch.id },
    { name: 'Sara Ali', email: 'sara.ali@apexflow.cloud', department: 'Sales', position: 'Branch Manager', salary: 75000, branchId: gulbergBranch.id },
    { name: 'Usman Malik', email: 'usman.malik@apexflow.cloud', department: 'Sales', position: 'Branch Manager', salary: 80000, branchId: islamabadBranch.id },
    { name: 'Zara Hussain', email: 'zara.h@apexflow.cloud', department: 'Sales', position: 'Sales Associate', salary: 45000, branchId: mainBranch.id },
    { name: 'Bilal Siddiqui', email: 'bilal.s@apexflow.cloud', department: 'Warehouse', position: 'Warehouse Supervisor', salary: 55000, branchId: mainBranch.id },
    { name: 'Mariam Nawaz', email: 'mariam.n@apexflow.cloud', department: 'Finance', position: 'Accountant', salary: 65000 },
    { name: 'Tariq Mehmood', email: 'tariq.m@apexflow.cloud', department: 'Sales', position: 'Sales Associate', salary: 42000, branchId: gulbergBranch.id },
  ]

  for (const emp of employees) {
    await prisma.employee.create({
      data: {
        tenantId: TENANT_ID,
        ...emp,
        hireDate: new Date('2023-01-15'),
        isActive: true,
      },
    })
  }
  console.log(`👔 Created ${employees.length} employees`)

  // ─── 11. Sample Sales ────────────────────────────────────
  console.log('💰 Creating sample sales...')
  const retailCustomer = await prisma.customer.findFirst({ where: { tenantId: TENANT_ID, type: 'retail' } })

  // Sale 1
  const sale1 = await prisma.sale.create({
    data: {
      tenantId: TENANT_ID,
      invoiceNumber: 'INV-2025-0001',
      customerId: retailCustomer?.id,
      branchId: mainBranch.id,
      employeeId: (await prisma.employee.findFirst({ where: { tenantId: TENANT_ID } }))?.id,
      subtotal: 2190,
      discount: 0,
      tax: 0,
      total: 2190,
      paymentMethod: 'cash',
      paymentStatus: 'paid',
      saleType: 'retail',
    },
  })
  // Add sale items for sale 1
  const book1 = books[0] // Kite Runner
  const book2 = books[4] // Alchemist
  await prisma.saleItem.createMany({
    data: [
      { saleId: sale1.id, bookId: book1.id, quantity: 1, unitPrice: book1.price, discount: 0, totalPrice: book1.price },
      { saleId: sale1.id, bookId: book2.id, quantity: 1, unitPrice: book2.price, discount: 0, totalPrice: book2.price },
    ],
  })

  // Sale 2
  const sale2 = await prisma.sale.create({
    data: {
      tenantId: TENANT_ID,
      invoiceNumber: 'INV-2025-0002',
      branchId: gulbergBranch.id,
      subtotal: 3490,
      discount: 100,
      tax: 0,
      total: 3390,
      paymentMethod: 'card',
      paymentStatus: 'paid',
      saleType: 'retail',
    },
  })
  const book3 = books[1] // Thousand Splendid Suns
  const book4 = books[9] // Sapiens
  await prisma.saleItem.createMany({
    data: [
      { saleId: sale2.id, bookId: book3.id, quantity: 1, unitPrice: book3.price, discount: 0, totalPrice: book3.price },
      { saleId: sale2.id, bookId: book4.id, quantity: 1, unitPrice: book4.price, discount: 100, totalPrice: book4.price - 100 },
    ],
  })

  // Sale 3 - wholesale
  const wholesaleCustomer = await prisma.customer.findFirst({ where: { tenantId: TENANT_ID, type: 'distributor' } })
  const sale3 = await prisma.sale.create({
    data: {
      tenantId: TENANT_ID,
      invoiceNumber: 'INV-2025-0003',
      customerId: wholesaleCustomer?.id,
      branchId: mainBranch.id,
      subtotal: 18500,
      discount: 1500,
      tax: 0,
      total: 17000,
      paymentMethod: 'bank',
      paymentStatus: 'paid',
      saleType: 'wholesale',
    },
  })
  await prisma.saleItem.createMany({
    data: [
      { saleId: sale3.id, bookId: books[0].id, quantity: 5, unitPrice: books[0].price, discount: 100, totalPrice: (books[0].price - 100) * 5 },
      { saleId: sale3.id, bookId: books[4].id, quantity: 10, unitPrice: books[4].price, discount: 50, totalPrice: (books[4].price - 50) * 10 },
    ],
  })

  console.log('💰 Created 3 sample sales with items')

  // ─── 12. Loyalty Tiers ───────────────────────────────────
  console.log('🏆 Creating loyalty tiers...')
  await prisma.loyaltyTier.createMany({
    data: [
      { tenantId: TENANT_ID, name: 'Bronze', minPoints: 0, maxPoints: 499, discount: 0, benefits: 'Standard pricing' },
      { tenantId: TENANT_ID, name: 'Silver', minPoints: 500, maxPoints: 1999, discount: 5, benefits: '5% discount on all purchases' },
      { tenantId: TENANT_ID, name: 'Gold', minPoints: 2000, maxPoints: 4999, discount: 10, benefits: '10% discount + priority service' },
      { tenantId: TENANT_ID, name: 'Platinum', minPoints: 5000, maxPoints: null, discount: 15, benefits: '15% discount + free delivery + exclusive access' },
    ],
  })
  console.log('🏆 Created 4 loyalty tiers')

  // ─── Done! ───────────────────────────────────────────────
  console.log('')
  console.log('═══════════════════════════════════════════════')
  console.log('✅ Demo data seeding complete!')
  console.log('═══════════════════════════════════════════════')
  console.log(`  🏢 Branches: 3`)
  console.log(`  🏗️ Warehouses: 1`)
  console.log(`  📂 Categories: ${categories.length}`)
  console.log(`  ✍️ Authors: ${authors.length}`)
  console.log(`  🏢 Publishers: ${publishers.length}`)
  console.log(`  📚 Books: ${books.length}`)
  console.log(`  ✏️ Stationery: ${stationeryProducts.length}`)
  console.log(`  👥 Customers: ${customers.length}`)
  console.log(`  👔 Employees: ${employees.length}`)
  console.log(`  💰 Sales: 3`)
  console.log(`  🏆 Loyalty Tiers: 4`)
  console.log('═══════════════════════════════════════════════')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
