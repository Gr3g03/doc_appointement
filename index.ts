import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import bodyParser from 'body-parser';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

const app = express();
app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json());

app.use(express.static('public'));

app.get('/', async (req, res) => {
  res.send('Server Up and Running');
});

app.listen(4000, () => {
  console.log(`Server up: http://localhost:4000`);
});

app.get('/status', (request, response) => response.json({ clients: clients.length }));

const PORT = 3000;

let clients = [];
let facts = [];

function createToken(id: number) {

  //@ts-ignore
  const token = jwt.sign({ id: id }, process.env.MY_SECRET, {
    expiresIn: '3days'
  });

  return token;

}

async function getUserFromToken(token: string) {

  //@ts-ignore
  const data = jwt.verify(token, process.env.MY_SECRET);

  const user = await prisma.user.findUnique({
    // @ts-ignore
    where: { id: data.id },
    include: { postedAppointements: { include: { normalUser: true } }, acceptedAppointemets: true }
  });

  return user;

}

app.post('/register', async (req, res) => {

  const { email, password, userName, firstName, lastName, address, bio, phone, avatar, isDoctor } = req.body;

  try {

    const hash = bcrypt.hashSync(password);

    const user = await prisma.user.create({

      //@ts-ignore
      data: {
        email: email,
        password: hash,
        userName: userName,
        firstName: firstName,
        lastName: lastName,
        //@ts-ignore
        address: address,
        bio: bio,
        phone: phone,
        avatar: avatar,
        isDoctor: isDoctor === "true" ? true : false
      },

      include: { postedAppointements: { include: { normalUser: true } }, acceptedAppointemets: true }

    });

    res.send({ user, token: createToken(user.id) });

  }

  catch (err) {
    // @ts-ignore
    res.status(400).send({ error: err.message });
  }

});

app.post('/login', async (req, res) => {

  const { email, password } = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: { email: email },
      include: { postedAppointements: { include: { normalUser: true } }, acceptedAppointemets: true }
    });

    // @ts-ignore
    const passwordMatches = bcrypt.compareSync(password, user.password);

    if (user && passwordMatches) {
      res.send({ user, token: createToken(user.id) });
    }
  } catch (error) {

    res.status(404).send({ error: "user or password incorrect" });

  }
});

app.get('/validate', async (req, res) => {

  // const token = req.headers.authorization || '';
  const token = String(req.query.token)

  try {
    const user = await getUserFromToken(token);
    res.send(user);
  }

  catch (err) {
    // @ts-ignore
    res.status(400).send({ error: err.message });
  }

});


app.get('/users', async (req, res) => {

  try {

    const users = await prisma.user.findMany({

      include: {
        postedAppointements: true,
      },

      where: {
        //@ts-ignore
        isDoctor: false
      }

    });

    res.send(users)

  }

  catch (err) {
    // @ts-ignore
    res.status(400).send({ error: err.message });
  }

});

app.get("/users/:id", async (req, res) => {

  const id = Number(req.params.id);

  try {

    const employee: any = await prisma.user.findUnique({
      where: { id },
      //@ts-ignore
      include: { acceptedAppointemets: true }
    });

    if (employee) {
      res.send(employee);
    }

    else {
      res.status(404).send({ error: "Employee not found" });
    }

  }

  catch (err) {
    //@ts-ignore
    res.status(400).send({ error: err.message });
  }

});

app.get('/doctors', async (req, res) => {

  try {

    const doctors = await prisma.user.findMany({

      include: {
        acceptedAppointemets: true
      },

      where: {
        //@ts-ignore
        isDoctor: true
      }

    });

    res.send(doctors)

  }

  catch (err) {
    // @ts-ignore
    res.status(400).send({ error: err.message });
  }

});

app.get("/doctors/:id", async (req, res) => {

  const id = Number(req.params.id);

  try {

    const doctor = await prisma.user.findUnique({
      where: { id },
      include: { acceptedAppointemets: true }
    });

    if (doctor) {
      res.send(doctor);
    }

    else {
      res.status(404).send({ error: "Doctor not found" });
    }

  }

  catch (err) {
    //@ts-ignore
    res.status(400).send({ error: err.message });
  }

});


app.get('/appointements', async (req, res) => {

  try {

    const appointements = await prisma.appointement.findMany({

      include: {
        normalUser: true,
        doctor: true,
      }

    });

    res.send(appointements)

  }

  catch (err) {
    // @ts-ignore
    res.status(400).send({ error: err.message });
  }

});

app.get("/appointements/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {

    const appointement = await prisma.appointement.findUnique({

      where: { id },

      include: {
        normalUser: true,
        doctor: true,
      }

    });

    if (appointement) {
      res.send(appointement);
    }

    else {
      res.status(404).send({ error: "Appointement not found" });
    }

  }

  catch (err) {
    //@ts-ignore
    res.status(400).send({ error: err.message });
  }

});


app.post("/appointements", async (req, res) => {
  const { title, end, start, description, status, doctor_id, user_id } = req.body;
  const token = req.headers.authorization;
  try {
    await prisma.appointement.create({
      data: { title, start, end, description, status, doctor_id, user_id },
    });
    const user = await getUserFromToken(token as string);
    const updatedDoctor = await prisma.user.findUnique({
      where: { id: doctor_id },
      include: { acceptedAppointemets: true },
    });
    if (user && updatedDoctor) {
      res.send({ updatedUser: user, updatedDoctor });
    }
  } catch (err: any) {
    res.status(400).send({ error: err.message });
  }
});


app.put('/appointement/:id', async (req, res) => {
  const { status } = req.body
  const id = Number(req.params.id)
  const token = req.headers.authorization;

  try {
    const event = await prisma.appointement.findUnique({ where: { id } });

    if (event && token) {
      const updatedDoctor = await prisma.appointement.update({
        where: { id },
        data: { status },
        include: { doctor: true, normalUser: true },
      });
      const updatedUser = await getUserFromToken(token as string);

      res.send({ updatedDoctor, updatedUser });
    } else {
      throw Error(
        "You are not authorized, or Event with this Id doesnt exist!"
      );
    }
  } catch (err) {
    //@ts-ignore
    res.status(400).send({ error: err.message });
  }
});



app.put("/editappointements/:id", async (req, res) => {
  const id = Number(req.params.id);
  const token = req.headers.authorization;
  const { start, end, title, description } = req.body;

  try {
    const event = await prisma.appointement.findUnique({ where: { id } });

    if (event && token) {
      const updatedEvent = await prisma.appointement.update({
        where: { id },
        data: { start, end, title, description },
        include: { doctor: true, normalUser: true },
      });
      const updatedUser = await getUserFromToken(token as string);

      res.send({ updatedEvent, updatedUser });
    } else {
      throw Error(
        "You are not authorized, or Event with this Id doesnt exist!"
      );
    }
  } catch (err) {
    //@ts-ignore
    res.status(400).send({ error: err.message });
  }
});


app.delete("/deleteApp/:id", async (req, res) => {
  const id = Number(req.params.id);
  const token = req.headers.authorization;

  try {
    const event = await prisma.appointement.findUnique({
      where: { id },
    });

    if (event && token) {
      const event = await prisma.appointement.delete({
        where: { id },
      });
      const updatedUser = await getUserFromToken(token as string);
      const updatedDoctor = await prisma.user.findUnique({
        where: { id: event.doctor_id },
        include: { acceptedAppointemets: true },
      });

      res.send({
        msg: "Event deleted succesfully",
        updatedUser,
        updatedDoctor,
      });
    } else {
      throw Error(
        "You are not authorized, or Event with this Id doesnt exist!"
      );
    }
  } catch (err) {
    //@ts-ignore
    res.status(400).send({ error: err.message });
  }
});
