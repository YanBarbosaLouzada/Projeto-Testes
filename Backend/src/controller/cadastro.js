export default class cadastro {
    static async verusuario(req, res) {
        return res.json({ message: "Usuário exibido com sucesso!" })
    }

    static async criarusuario(req, res) {
        const {name} = req.body
        return res.json({ message: `Usuário criado com sucesso! Bem vindo: ${name}` })
    }

    static async editarusuario(req, res) {
        const {name} = req.body
        return res.json({ message: `Usuário editado com sucesso! Bem vindo: ${name}` })
        }

    static async deletarusuario(req, res) {
        const { id } = req.params
        return res.json({ message: "Usuário deletado com sucesso! ID do usuário deletado: ", id })
    }
}