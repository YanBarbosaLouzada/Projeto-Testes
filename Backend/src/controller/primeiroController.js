export default class primeiroController {
    static async olamundo(req, res) {
        return res.json({ message: "Olá mundo, esta é a minha primeira rota!" })
    }
}