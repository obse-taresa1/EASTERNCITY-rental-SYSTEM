const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function restoreUsers() {
  const users = [
    { name: 'Elias Tadesse', email: 'eliastadesse681@mail.tm', city: 'Harar' },
    { name: 'Martha Alemu', email: 'marthaalemu824@mail.tm', city: 'Jigjiga' },
    { name: 'Saron Assefa', email: 'saronassefa223@mail.tm', city: 'Dire Dawa' },
    { name: 'Hawa Ibrahim', email: 'hawaibrahim744@mail.tm', city: 'Harar' },
    { name: 'Bethlehem Desta', email: 'bethlehemdesta950@mail.tm', city: 'Jigjiga' },
    { name: 'Hana Tesfaye', email: 'hanatesfaye52@mail.tm', city: 'Harar' },
    { name: 'Sara Yonas', email: 'sarayonas23@mail.tm', city: 'Dire Dawa' },
    { name: 'Ahmed Ali', email: 'ahmedali634@mail.tm', city: 'Harar' },
    { name: 'Ruth Solomon', email: 'ruthsolomon653@mail.tm', city: 'Dire Dawa' },
    { name: 'Mustafe Ibrahim', email: 'mustafeibrahim652@mail.tm', city: 'Harar' },
    { name: 'Dawit Solomon', email: 'dawitsolomon431@mail.tm', city: 'Jigjiga' },
    { name: 'Mohamed Hassan', email: 'mohamedhassan208@mail.tm', city: 'Harar' },
    { name: 'Fadumo Ali', email: 'fadumoali917@mail.tm', city: 'Harar' },
    { name: 'Meron Girma', email: 'merongirma665@mail.tm', city: 'Harar' },
    { name: 'Lidia Tadesse', email: 'lidiatadesse202@mail.tm', city: 'Dire Dawa' }
  ];

  const hash = await bcrypt.hash('Password123!', 10);
  
  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { password: hash, verificationStatus: 'APPROVED' },
      create: { 
        name: u.name, 
        email: u.email, 
        password: hash, 
        city: u.city, 
        role: 'USER', 
        verificationStatus: 'APPROVED' 
      }
    });
  }
  console.log("Restored 15 users!");
}
restoreUsers().catch(console.error).finally(() => prisma.$disconnect());
