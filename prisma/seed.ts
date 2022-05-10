import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

const users = [
    {
        id: 1,
        userName: 'avenger22',
        email: 'jurgenhasmeta@email.com',
        password: bcrypt.hashSync('jurgen123', 8),
        firstName: "Jurgen",
        lastName: "Hasmeta",
        address: "Rr Qazim Vathi",
        bio: "I am Jurgen Hasmeta",
        phone: "0695554532",
        avatar: "avatar1.jpg",
        isDoctor: true  
    },
    {
        id: 2,
        userName: 'atleti22',
        email: 'atletiko@email.com',
        password: bcrypt.hashSync('atleti123', 8),
        firstName: "Atletiko",
        lastName: "Madrid",
        address: "Rr Bardhyl",
        bio: "I am Atletiko Madrid",
        phone: "0693454532",
        avatar: "avatar2.jpg",
        isDoctor: false
    }
];

const appointments = [
    {
        id: 1,
        price: 350,
        deadline: String(Date.now()),
        title: "Kidney visit",
        description: "Vizite tek doktorri kam probleme me kidney",
        status: 2,
        user_id: 2,
        doctor_id: 1,
        category_id: 1
    }
]

const categories = [
    {
        id: 1,
        category_name: "Kidney",
        category_logo: "kidney.jpg"
    }
]

const bids = [
    {
        id: 1,
        appointment_id: 1,
        bids: 5,
        user_id: 2
    }
]

async function createStuff() {
    
    await prisma.user.deleteMany();

    for (const user of users) {
        await prisma.user.create({ data: user });
    }

    await prisma.category.deleteMany()

    for (const category of categories) {
        await prisma.category.create({ data: category });
    }

    await prisma.appointement.deleteMany()

    for (const appointment of appointments) {
        await prisma.appointement.create({ data: appointment });
    }

    await prisma.bid.deleteMany()

    for (const bid of bids) {
        await prisma.bid.create({ data: bid });
    }

}

createStuff();