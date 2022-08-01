import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { getUser } from "../models/user.model.js";
import { dataEnv } from "../config/env.config.js";
import { v4 as uuidv4 } from "uuid";
import sgMail from "@sendgrid/mail";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const data = dotenv.config({
  path: path.resolve(__dirname, `../environments/.env.${process.env.NODE_ENV}`),
});


const user_create = (req, res) => {
  getUser.User.create(
    {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      estado:false
    },
    { fields: ["name", "email", "password","estado"] }
  )
    .then(() => {
      res.send("creado");
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

const user_login = async (req, res) => {
  const user = await getUser.User.findOne({ where: { email: req.body.email } });




  if (user) {
    const validPassword = bcryptjs.compareSync(
      req.body.password,
      user.password
    );

    if (user.estado === true) {
      if (validPassword) {
        const token = jwt.sign(
          {
            sub: user.name,
            id: user.id,
          },
          "secret",
          { expiresIn: "30m" },
          data.parsed.JWT_TOKEN_SECRET,
          { algorithm: "HS256" }
        );

        user.token = token;

        res.header("auth-token", token).json({
          error: null,
          data: {
            token,
            user: user.id,
          },
        });


      } else {
        if (!validPassword)
          return res.status(400).json({ error: "contraseña no válida" });
      }

    } else {
      return res.status(400).json({ error: "Usuario no verificado" });
    }

  } else {
    return res.status(400).json({ error: "Usuario no encontrado" });
  }


};

const recovery_password = (req, res) => {
  const token = uuidv4();
  console.log(dataEnv.parsed.SENDGRID_APIKEY);
  sgMail.setApiKey(dataEnv.parsed.SENDGRID_APIKEY);
  const msg = {
    to: req.body.email,
    from: "211105@ids.upchiapas.edu.mx",
    subject: "Recupera Contraseña",
    text: "Recupera tu Contraseña",
    html: `
    <p>Has click en el siguiente enlace para reestablecer la contraseña</p>
    <ul><li><a href=http://mariocs.hopto.org/recovery_password?${token}&email=${req.body.email}>Website</a></li></ul>`,
  };
  sgMail
    .send(msg)
    .then((response) => {
      if (response[0].statusCode === 202) {
        getUser.UserRecovery.create(
          {
            email: req.body.email,
            token,
          },
          { fields: ["email", "token"] }
        ).then((data) => {
          res.send(data);
        });
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

const regsitro = (req, res) => {
  const token = uuidv4();
  sgMail.setApiKey(dataEnv.parsed.SENDGRID_APIKEY);
  const msg = {
    to: req.body.email,
    from: "211105@ids.upchiapas.edu.mx",
    subject: "validar",
    text: "validar",
    html: `
    <p>Acceda al siguiente enlace para validar su contraseña.</p>
    <ul><li><a href=http://mariocs.hopto.org/waiting?${token}&email=${req.body.email}> Regsitro</a></li></ul>`,
  };
  sgMail
    .send(msg)
    .then((response) => {
      if (response[0].statusCode === 202) {
        getUser.UserRecovery.create(
          {
            email: req.body.email,
            token,
          },
          { fields: ["email", "token"] }
        ).then((data) => {
          res.send(data);
        });
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

const user_update = (req, res) => {
  let email = req.body.email;
  let pass = req.body.password;
  let password = bcryptjs.hashSync(pass);
  let newDatas = { email, password };
  getUser.User.findOne({ where: { email: email } })

    .then((r) => {
      r.update(newDatas);
      res.send("su contraseña se a actualizado exitosamente")
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

const update_estado = (req, res) => {
  let email = req.body.email;
  let estado = true;
  let newDatas = { email, estado };
  getUser.User.findOne({ where: { email: email } })

    .then((r) => {
      r.update(newDatas);
      res.send("Usuario Verificado")
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

//user.password = user.password && user.password != "" ? bcryptjs.hashSync(user.password, 10) : "";

export const userController = {
  user_create,
  user_login,
  user_update,
  recovery_password,
  update_estado,
  regsitro
};
