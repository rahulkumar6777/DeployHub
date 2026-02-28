import { Model } from "../../../models/index.js";

const Invoice = async (req, res) => {
  try {
    const user = req.user;

    const invoices = await Model.CompletedOrder.find({ userid: user._id });

    return res.status(200).json({
      data: invoices,
    });
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

export { Invoice };
