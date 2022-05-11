import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

const users = [
    {
        id: 1,
        userName: 'Grigori',
        email: 'grigor@email.com',
        password: bcrypt.hashSync('123', 8),
        firstName: "Grigori",
        lastName: "Grigori",
        address: "Rr Qazim Vathi",
        bio: "first Bio",
        phone: "0695554532",
        avatar: "avatar1.jpg",
        isDoctor: true
    },
    {
        id: 2,
        userName: 'test',
        email: 'test@email.com',
        password: bcrypt.hashSync('123', 8),
        firstName: "test",
        lastName: "test",
        address: "Rr Bardhyl",
        bio: "test",
        phone: "0693454532",
        avatar: "avatar2.jpg",
        isDoctor: false
    }
];

const appointments = [
    {
        id: 1,
        startDate: String(Date.now()),
        endDate: String(Date.now()),
        title: "Kidney visit",
        description: "Vizite tek doktorri kam probleme me kidney",
        status: 'pending',
        user_id: 2,
        doctor_id: 1,
    },
    {
        id: 2,
        startDate: String(Date.now()),
        endDate: String(Date.now()),
        title: " visit",
        description: "Vizite tek doktorri",
        status: 'pending',
        user_id: 2,
        doctor_id: 1,
    }
]



async function createStuff() {

    // await prisma.user.deleteMany();

    for (const user of users) {
        await prisma.user.create({ data: user });
    }

    // await prisma.category.deleteMany()



    // await prisma.appointement.deleteMany()

    for (const appointment of appointments) {
        await prisma.appointement.create({ data: appointment });
    }

    // await prisma.bid.deleteMany()

    // for (const bid of bids) {
    //     await prisma.bid.create({ data: bid });
    // }

}

createStuff();