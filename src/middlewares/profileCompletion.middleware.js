import AppError from "./../errors/app-error.js";
import User from "./../models/user.model.js";
import { isProfileCompered } from "./../services/user.service.js";

const profileCompletion = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)

    if(!user){
        throw new AppError("User not found",404)
    }

    if(!isProfileCompleted(user)){
        throw new AppError("Please complete your profile first", 403)
    }
    next()
  } catch (error) {
    next(error);
  }
};


export default profileCompletion;