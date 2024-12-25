class ActivateController{
    async activate(req,res){
        res.json({ message: 'Ok' })
    }
}

module.exports = new ActivateController();