import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json());
const prisma = new PrismaClient();
const PORT = 4000;

function createToken(id: number) {
  const token = jwt.sign({ id: id }, process.env.MY_SECRET, {
    expiresIn: "3days",
  });
  return token;
}

async function getUserFromToken(token: string) {
  const data = jwt.verify(token, process.env.MY_SECRET) as { id: number };
  const employee = await prisma.user.findUnique({
    where: { id: data.id },
    include: { postedAppointements: { include: { normalUser: true } }, acceptedAppointemets: true }
  });

  return employee;
}



app.get("/validate", async (req, res) => {
  const token = req.headers.authorization || " ";

  try {
    // @ts-ignore
    const user = await getUserFromToken(token);
    res.send(user);
  } catch (err) {
    // @ts-ignore
    res.status(400).send({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
      include: { postedAppointements: { include: { normalUser: true } }, acceptedAppointemets: true }
    });

    const checkPassword = bcrypt.compareSync(password, user.password);
    if (user && checkPassword) {
      res.send({ user, token: createToken(user.id) });
    } else {
      res.status(404).send({ error: "user or password incorrect" });
    }
  } catch (err) {
    //@ts-ignore
    res.status(400).send({ error: err.message });
  }
});


app.post('/signup', async (req, res) => {
  const { username, full_name, email, password, avatar, phone, address, bio, isDoctor } = req.body

  try {
    const hash = bcrypt.hashSync(password, 8)
    const user = await prisma.user.create({
      data: { username, full_name, email, password: hash, avatar, phone, address, bio, isDoctor },
      include: { postedAppointements: { include: { normalUser: true } }, acceptedAppointemets: true }
    })
    res.send({ user, token: createToken(user.id) })
  }

  catch (err) {
    //@ts-ignore
    res.status(400).send({ error: err.message })
  }
})

app.get("/users", async (req, res) => {
  try {
    const user = await prisma.user.findMany({
      include: {
        postedAppointements: true,
      },
      where: {
        isDoctor: false
      }
    });
    res.send(user)

  } catch (err) {
    //@ts-ignore
    res.send({ error: err.messaage })
  }
});

app.get("/users/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const employee = await prisma.user.findUnique({
      where: { id },
      include: { acceptedAppointemets: true }
    });
    if (employee) {
      res.send(employee);
    } else {
      res.status(404).send({ error: "Employee not found" });
    }
  } catch (err) {
    //@ts-ignore
    res.status(400).send({ error: err.message });
  }
});

app.get('/categories', async (req, res) => {
  try {
    const categories = prisma.category.findMany();
    res.send(categories)
  } catch (err) {
    //@ts-ignore
    res.status(400).send({ error: err.message })
  }
})


app.post('/appointement', async (req, res) => {

  const { price, deadline, title, description, status, category_id } = req.body
  const token = req.headers.authorization || ''

  try {
    const user = await getUserFromToken(token)
    if (user.isDoctor) {
      const project = await prisma.appointement.create({
        data: { price, deadline, title, description, status, doctor_id: user.id, category_id: category_id }
      })

      res.send(project)
    } else {
      res.status(401).send("You're not authorized to create a project")
    }
  }
  catch (err) {
    //@ts-ignore
    res.status(400).send({ error: err.message })
  }
})


app.get('/appointement', async (req, res) => {
  const { category_id } = req.body
  try {
    let projects = await prisma.appointement.findMany({ where: { user_id: null } })
    if (category_id) {
      projects = projects.filter(appointement => appointement.category_id === category_id)
    }
    res.send(projects)

  } catch (err) {
    //@ts-ignore
    res.status(400).send({ error: err.message })
  }
})

app.get('/appointement/:id', async (req, res) => {
  const id = Number(req.params.id)
  try {
    let project = await prisma.appointement.findUnique({ where: { id } })
    if (project) {
      res.send(project)
    } else {
      res.status(404).send({ error: "Project not found" })
    }
  } catch (err) {
    //@ts-ignore
    res.status(400).send({ error: err.message })
  }
})

app.patch('/appointement/:id', async (req, res) => {
  const { user_id } = req.body
  const id = Number(req.params.id)
  try {
    let project = await prisma.appointement.update({ where: { id }, data: { user_id } })
    if (project) {
      res.send(project)
    } else {
      res.status(404).send({ error: "Project not found" })
    }
  } catch (err) {
    //@ts-ignore
    res.status(400).send({ error: err.message })
  }
})


app.post('/bids', async (req, res) => {

  const { project_id, bids, user_id } = req.body
  try {
    const bid = await prisma.bids.create({
      data: { project_id, bids, user_id }
    })
    res.send(bid)
  }
  catch (err) {
    //@ts-ignore
    res.status(400).send({ error: err.message })
  }
})

app.get('/bids/:project_id', async (req, res) => {
  const project_id = Number(req.params.project_id)
  const bid = await prisma.bids.findMany({ include: { normalUser: true }, where: { project_id } })

  res.send(bid)

})

app.delete('/bids/:id', async (req, res) => {
  const id = Number(req.params.id)
  try {
    const bid = await prisma.bids.delete({ where: { id } })
    res.send(bid)
  }
  catch (err) {
    //@ts-ignore
    res.status(400).send({ error: err.message })
  }
})


// app.post('/reviews', async (req, res) => {

//   const { text, project_id, employee_id, dateCreated } = req.body
//   try {
//     const reviews = await prisma.review.create({
//       data: { text, project_id, employee_id, dateCreated }
//     })
//     res.send(reviews)
//   }
//   catch (err) {
//     res.status(400).send({ error: err.message })
//   }
// })

// app.get('/reviews', async (req, res) => {
//   const bid = await prisma.review.findMany({ include: { employee: true, project: true } })

//   res.send(bid)

// })


// app.post('/conversations', async (req, res) => {
//   const token = req.headers.authorization || ""

//   const { participant_id } = req.body
//   try {
//     const user = await getUserFromToken(token);
//     const conversation = await prisma.conversation.create({
//       data: { user_id: user.id, participant_id },
//       include: { chats: true }
//     })
//     res.send(conversation)
//   } catch (err) {
//     //@ts-ignore
//     res.status(400).send({ error: err.message })
//   }
// })


// app.get('/conversations', async (req, res) => {
//   const token = req.headers.authorization || ""
//   try {
//     const user = await getUserFromToken(token);
//     const conversations = await prisma.conversation.findMany({
//       where: { OR: [{ user_id: user.id }, { participant_id: user.id }] },
//       include: { chats: true }
//     })
//     res.send(conversations)
//   } catch (err) {
//     //@ts-ignore
//     res.status(400).send({ error: err.message })
//   }
// })


// app.post('/chat', async (req, res) => {
//   const { messageText, conversation_id } = req.body
//   const token = req.headers.authorization || ''
//   try {
//     const user = await getUserFromToken(token)
//     const chat = await prisma.chat.create({
//       data: { messageText, conversation_id, user_id: user.id }
//     })
//     res.send(chat)

//   }
//   catch (err) {
//     //@ts-ignore
//     res.status(400).send({ error: err.message })
//   }
// })

app.listen(PORT, () => {
  console.log(`Server on http://localhost:${PORT}`);
});
