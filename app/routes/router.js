const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

router.get("/", (req, res) => {
    res.render("pages/index", {
        erros: null,
        resultado: null,
        valores: {
            DadosNome: "",
            DadosTelefone: "",
            DadosEmail: "",
            DadosAssunto: "",
            DadosMenssagem: ""
        }
    });
});

router.post(
    "/Dados",

    body("DadosNome")
        .trim()
        .isLength({ min: 3 })
        .withMessage("O nome deve ter no mínimo 3 caracteres!"),

    body("DadosTelefone")
        .matches(/^\d{11}$/)
        .withMessage("O telefone deve conter 11 dígitos numéricos!"),

    body("DadosEmail")
        .trim()
        .isEmail()
        .withMessage("Digite um e-mail válido!")
        .isLength({ max: 50 })
        .withMessage("O e-mail deve ter no máximo 50 caracteres!"),

    body("DadosAssunto")
        .trim()
        .notEmpty()
        .withMessage("O assunto é obrigatório!")
        .isLength({ max: 30 })
        .withMessage("O assunto deve ter no máximo 30 caracteres!"),

    body("DadosMenssagem")
        .trim()
        .notEmpty()
        .withMessage("A mensagem é obrigatória!")
        .isLength({ max: 3000 })
        .withMessage("A mensagem deve ter até 3000 caracteres!"),

    async (req, res) => {
        const erros = validationResult(req);

        if (!erros.isEmpty()) {
            return res.status(400).render("pages/index", {
                erros: erros.array(),
                valores: req.body,
                resultado: null
            });
        }

        const {
            DadosNome,
            DadosTelefone,
            DadosEmail,
            DadosAssunto,
            DadosMenssagem
        } = req.body;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            replyTo: DadosEmail,
            subject: DadosAssunto,
            text: `
Nome: ${DadosNome}
Telefone: ${DadosTelefone}
E-mail: ${DadosEmail}

Mensagem:
${DadosMenssagem}
            `,
            html: `
                <h2>Nova mensagem do formulário</h2>
                <p><strong>Nome:</strong> ${escapeHtml(DadosNome)}</p>
                <p><strong>Telefone:</strong> ${escapeHtml(DadosTelefone)}</p>
                <p><strong>E-mail:</strong> ${escapeHtml(DadosEmail)}</p>
                <p><strong>Assunto:</strong> ${escapeHtml(DadosAssunto)}</p>
                <p><strong>Mensagem:</strong></p>
                <p>${escapeHtml(DadosMenssagem).replace(/\n/g, "<br>")}</p>
            `
        };

        try {
            await transport.sendMail(mailOptions);

            return res.render("pages/index", {
                erros: null,
                valores: {
                    DadosNome: "",
                    DadosTelefone: "",
                    DadosEmail: "",
                    DadosAssunto: "",
                    DadosMenssagem: ""
                },
                resultado: {
                    sucesso: "E-mail enviado com sucesso!"
                }
            });
        } catch (error) {
            console.error("Erro ao enviar e-mail:", error);

            return res.status(500).render("pages/index", {
                erros: null,
                valores: req.body,
                resultado: {
                    erro: "Não foi possível enviar sua mensagem. Tente novamente."
                }
            });
        }
    }
);

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

module.exports = router;