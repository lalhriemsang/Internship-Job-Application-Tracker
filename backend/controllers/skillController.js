const Skills = require("../models/Skills");

exports.getSkillsByUser = async (req, res) => {
  const { userId } = req.query; // Use req.query for query parameters
  console.log("hadsa", userId);

  try {
    let userSkills = await Skills.findOne({ user: userId });

    if (!userSkills) {
      // If no skills document found, create a new skills document for the user
      userSkills = new Skills({
        user: userId,
        skills: [], // Initialize with an empty skills array
      });
      await userSkills.save(); // Save the new skills document
    }

    const skills = userSkills.skills.map((skill) => ({
      skill: skill.skill,
      proficiency: skill.proficiency,
      dateGained: skill.dateGained,
    }));
    console.log(skills);
    return res.status(200).json(skills); // Return only the required fields
  } catch (err) {
    // Catch and handle errors
    console.error(err);
    return res
      .status(500)
      .json({ message: "Error fetching skills", error: err.message });
  }
};

// Function to add a new skill for a user
exports.addSkill = async (req, res) => {
  const { userId, skill, proficiency, dateGained } = req.body;

  try {
    const userSkills = await Skills.findOne({ user: userId });

    if (!userSkills) {
      const newSkill = new Skills({
        user: userId,
        skills: [
          {
            skill: skill,
            proficiency: proficiency,
            dateGained: dateGained || Date.now(),
          },
        ],
      });
      await newSkill.save();
      return res.status(201).json(newSkill);
    }

    userSkills.skills.push({
      skill: skill,
      proficiency: proficiency,
      dateGained: dateGained || Date.now(),
    });

    // Save the updated skills document
    await userSkills.save();
    return res.status(201).json(userSkills);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Error adding skill", error: err.message });
  }
};

// Function to update a skill for a user
exports.updateSkill = async (req, res) => {
  const { userId } = req.params;
  const { skill, proficiency, dateGained } = req.body;

  try {
    const userSkills = await Skills.findOne({
      user: userId,
      "skills.skill": skill,
    });

    if (!userSkills) {
      return res.status(404).json({ message: "Skill not found." });
    }

    const updatedSkill = await Skills.updateOne(
      {
        user: userId,
        "skills.skill": skill,
      },
      {
        $set: {
          "skills.$.proficiency":
            proficiency !== undefined
              ? proficiency
              : userSkills.skills[0].proficiency,
          "skills.$.dateGained": dateGained || userSkills.skills[0].dateGained,
        },
      },
      {
        new: true,
      }
    );

    return res
      .status(200)
      .json({ message: "Skill updated successfully.", updatedSkill });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Error updating skill", error: err.message });
  }
};

exports.deleteSkill = async (req, res) => {
  const { userId } = req.params;
  const { skill } = req.body;

  try {
    // Find the document with the specific user and the skill name
    const userSkills = await Skills.findOne({
      user: userId,
      "skills.skill": skill,
    });

    if (!userSkills) {
      return res.status(404).json({ message: "Skill not found." });
    }

    const updatedSkills = await Skills.updateOne(
      {
        user: userId,
        "skills.skill": skill, // Match the user and skill name
      },
      {
        $pull: {
          skills: { skill: skill },
        },
      }
    );

    if (updatedSkills.modifiedCount === 0) {
      return res.status(400).json({ message: "No skill deleted." });
    }

    return res.status(200).json({ message: "Skill deleted successfully." });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Error deleting skill", error: err.message });
  }
};
