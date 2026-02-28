export const fullName = async (req, res) => {
  try {
    const user = req.user;

    const { fullname } = req.body;
    if(!fullname){
        return res.status(400).json({
            message: "fullname is required"
        })
    }

    console.log(user)
    user.fullname = fullname;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      error: "internal Server Error",
    });
  }
};
