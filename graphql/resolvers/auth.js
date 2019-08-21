const User = require('../../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

module.exports = {
    createUser: async (args) => {
        try {
            const foundUSer = await User.findOne({ email: args.userInput.email })
            if (foundUSer) {
                throw new Error('user already exists');
            }
            const hashedPassword = await bcrypt.hash(args.userInput.password, 8)
            const user = new User({
                email: args.userInput.email,
                password: hashedPassword
            })
            const returnedUserData = await user.save();
            return { ...returnedUserData._doc, password: null };
        } catch (err) {
            throw err;
        }
    }, login: async ({email, password}) => {
        
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('email and password doesnot match');
        }
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            throw new Error('email and password doesnot match');
        }
       const token = jwt.sign({ userId: user.id, email: user.email } ,'secretkey',{
            expiresIn:'1h'
        });
        return {userId: user.id ,token : token , tokenExpiration: 1};
    }
}