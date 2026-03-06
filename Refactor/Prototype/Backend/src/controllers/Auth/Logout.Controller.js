const Logout = async (req, res) => {
    try {

        const user = req.user;
        

        user.refreshtoken = '';
        user.save({ validateBeforeSave: false })

        return res.status(200)
        .clearCookie("refreshToken")
        .json({
            message: "Logout Success",
            success: true
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: "Internal server Error"
        })
    }
}

export { Logout };