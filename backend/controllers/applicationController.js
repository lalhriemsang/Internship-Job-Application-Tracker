require("dotenv").config();
const Application = require("../models/Application");
const axios = require("axios");
const Skills = require("../models/Skills");

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function findUserSkills(userId) {
  try {
    // Fetch user skills using the userId
    const userSkills = await Skills.findOne({ user: userId });

    if (!userSkills) {
      throw new Error("User skills not found");
    }

    // Map to extract only 'skill' and 'proficiency' from the skills array
    const skills =
      userSkills.skills.map((skill) => ({
        skill: skill.skill,
        proficiency: skill.proficiency,
      })) || [];

    return skills; // Return only the required fields
  } catch (err) {
    console.error(err);
    throw err;
  }
}

exports.getApplications = async (req, res) => {
  const { userId } = req.query;
  try {
    const applications = await Application.find({ user: userId });

    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addApplication = async (req, res) => {
  let { userId, company, job, jobDetails, deadline, contactInfo } = req.body;
  try {
    if (!company || !job || !jobDetails || !deadline || !contactInfo) {
      return res.status(400).send("All fields must be present");
    }

    // Create a new application
    const application = new Application({
      user: userId,
      company,
      job,
      jobDetails,
      deadline,
      contactInfo,
    });

    // Save the application
    await application.save();
    res.status(201).json(application);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.SkillAnaylysisForJob = async (req, res) => {
  const { userId, company, job } = req.body;

  try {
    const application = await Application.findOne({
      user: userId, // Match the user ID
      company: company,
      job: job,
    });

    if (!application) {
      return res
        .status(404)
        .json({ message: "Application not found for this job" });
    }

    const jobDetails = application.jobDetails;
    const skills = await findUserSkills(userId); // skill array of strings AWS,EC2

    if (!skills) {
      skills: {
      }
    }

    const requiredSkills = await extractJobSkills(jobDetails);

    const { matchedSkills, improveSkills, missingSkills } = compareSkills(
      requiredSkills,
      skills
    );

    // send as json and extract and put them in frontend
    res.status(200).json({
      message: "Skill gap analysis complete",
      job,
      company,
      matchedSkills,
      improveSkills,
      missingSkills,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.SkillsRecommedationsForJob = async (req, res) => {
  const { userId, company, job } = req.body;
  try {
    const application = await Application.findOne({
      company: company,
      job: job,
    });

    if (!application) {
      return res
        .status(404)
        .json({ message: "Application not found for this job" });
    }

    const jobDetails = application.jobDetails;
    console.log(userId, company, job);

    const skills = await findUserSkills(userId); // skill array of strings AWS,EC2
    console.log(userId, company, job);

    const requiredSkills = await extractJobSkills(jobDetails);
    console.log("jobDetails:  " + jobDetails);

    const { matchedSkills, improveSkills, missingSkills } = compareSkills(
      requiredSkills,
      skills
    );

    const skillRecommendations = await generateSkillRecommendations(
      jobDetails,
      missingSkills
    );
    console.log(userId, company, job);
    console.log(skillRecommendations);
    // Send the recommendations as the response
    res.status(200).json({ skillRecommendations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.interviewPrepForJob = async (req, res) => {
  const { userId, company, job } = req.body;

  try {
    const application = await Application.findOne({
      user: userId,
      company: company,
      job: job,
    });

    if (!application) {
      return res
        .status(404)
        .json({ message: "Application not found for this job" });
    }

    const jobDetails = application.jobDetails;

    const recommendations = await interviewPrep(jobDetails);

    // Send the recommendations as the response
    res.status(200).json({ recommendations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateApplication = async (req, res) => {
  const { applicationId } = req.params;
  const { company, job, jobDetails, deadline, contactInfo } = req.body;

  try {
    // Find the existing application
    const application = await Application.findOne({
      _id: applicationId,
      user: req.userId,
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const updatedApplication = {
      company: company || application.company,
      job: job || application.job,
      jobDetails: jobDetails || application.jobDetails,
      deadline: deadline || application.deadline,
      contactInfo: contactInfo || application.contactInfo,
    };

    // Perform the update
    const updatedDoc = await Application.findOneAndUpdate(
      { _id: applicationId, user: req.userId },
      updatedApplication,
      { new: true }
    );

    // Return the updated application
    res.status(200).json(updatedDoc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteApplication = async (req, res) => {
  const { applicationId } = req.params;

  try {
    const application = await Application.findOneAndDelete({
      _id: applicationId,
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json({ message: "Application deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

async function extractJobSkills(jobDetails) {
  const prompt = `
    The following is a job description:

    ${jobDetails}

    Please extract and list all the technical and soft skills required for this job. For each skill, indicate if it requires strong proficiency. Only provide the skill name and proficiency level (1 for strong proficiency, 0 for normal proficiency). Format the result as a list of objects with "skill" and "proficiency" keys, one per line, without any other explanation or details.
    if there aren't still return in the format with empty output
    Example output:
    [{ "skill": "AWS", "proficiency": 1 }, { "skill": "Linux", "proficiency": 0 }]
  `;

  try {
    // Send request to Gemini API for inference
    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          key: GEMINI_API_KEY,
        },
      }
    );

    const rawText = response.data.candidates[0].content.parts[0].text;

    // Remove the ```json code block and parse the JSON
    const jsonText = rawText.replace("```json\n", "").replace("```", "").trim();

    const skills = JSON.parse(jsonText);

    // console.log("Extracted Skills:", skills); // Log the extracted skills for verification

    return skills;
  } catch (error) {
    console.log(error);
    throw new Error(
      `Failed to extract job skills using Gemini: ${error.message}`
    );
  }
}

function compareSkills(requiredSkills, userSkills) {
  const matchedSkills = [];
  const improveSkills = [];
  const missingSkills = [];

  requiredSkills.forEach((reqSkill) => {
    const userSkill = userSkills.find(
      (skill) => skill.skill === reqSkill.skill
    );

    if (userSkill) {
      matchedSkills.push(reqSkill.skill);

      if (reqSkill.proficiency === 1 && userSkill.proficiency < 2) {
        improveSkills.push(reqSkill.skill);
      }
    } else {
      missingSkills.push(reqSkill.skill);
    }
  });

  return { matchedSkills, improveSkills, missingSkills };
}

async function generateSkillRecommendations(jobDetails, missingSkills) {
  // Create a prompt to send to the Gemini API
  const prompt = `
    Job Description:
    ${jobDetails}

    Missing Skills:
    ${missingSkills.join(", ")}

    Please provide a list of recommended online courses, tutorials, or certifications for the missing skills above. For each skill, recommend at least one relevant online resource that can help an individual learn or improve that skill. Include the course name, provider, and a short description.

    Format the result as a list of objects with the keys "skill", "courseName", "provider", and "description". Example:
    [
      { "skill": "AWS", "courseName": "AWS Certified Solutions Architect", "provider": "Udemy", "description": "A comprehensive course to prepare for the AWS Solutions Architect exam." },
      { "skill": "Linux", "courseName": "Learn Linux", "provider": "Coursera", "description": "Beginner-level course to understand Linux fundamentals." }
    ]
    if there aren't still return in the format with empty output

  `;

  try {
    // Send the request to the Gemini API
    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          key: GEMINI_API_KEY,
        },
      }
    );

    // Log the Gemini response for debugging
    console.log(
      "Gemini API Response:",
      response.data.candidates[0].content.parts[0].text.trim()
    );

    // Check if the response has the necessary content
    if (
      response.data &&
      response.data.candidates &&
      response.data.candidates.length > 0
    ) {
      // Extract the text part of the response
      const generatedContent =
        response.data.candidates[0].content.parts[0].text.trim();

      // Remove the Markdown formatting (the ```json and closing ```)
      const jsonString = generatedContent.replace(/```json|```/g, "").trim();

      // Parse the cleaned JSON string
      const recommendations = JSON.parse(jsonString);

      // Return the recommendations in the desired format
      return recommendations;
    } else {
      throw new Error("No recommendations found in the Gemini API response.");
    }
  } catch (error) {
    console.error("Error generating skill recommendations:", error);
    throw new Error("Failed to generate skill recommendations.");
  }
}

async function interviewPrep(jobDetails) {
  const prompt = `
    Job Description:
    ${jobDetails}
    
    Please provide a list of revision and practice question platforms that can help an individual prepare for an interview for the above job     description. The platforms should focus on:
    1. Coding practice and problem-solving (e.g., data structures, algorithms)
    2. System design and architecture questions
    3. Behavioral interview preparation (e.g., leadership, teamwork, conflict resolution)
    4. Role-specific practice (e.g., for a software engineer, product manager, or data scientist, etc.)
    
    For each platform, provide the following details:
    - "platformName": The name of the platform (e.g., LeetCode, HackerRank, InterviewBit)
    - "url": The URL where the platform can be accessed (e.g., https://leetcode.com)
    - "focus": A brief description of the platform's focus (e.g., coding challenges, system design, mock interviews)
    - "category": The main interview preparation category (e.g., "Coding", "System Design", "Behavioral", "Role-specific")
    
    Example format:
    [
      { 
        "platformName": "LeetCode", 
        "url": "https://leetcode.com", 
        "focus": "A platform for practicing coding challenges with a large problem set.", 
        "category": "Coding"
      },
      { 
        "platformName": "Pramp", 
        "url": "https://www.pramp.com", 
        "focus": "Provides mock technical and behavioral interviews.", 
        "category": "Mock Interviews"
      }
    ]
  `;

  try {
    // Send request to Gemini API for inference
    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          key: GEMINI_API_KEY,
        },
      }
    );

    const rawText = response.data.candidates[0].content.parts[0].text;
    console.log(rawText);
    // Remove the ```json code block and parse the JSON
    const jsonText = rawText.replace("```json\n", "").replace("```", "").trim();

    const recommendations = JSON.parse(jsonText);

    return recommendations;
  } catch (error) {
    throw new Error(
      `Failed to extract job skills using Gemini: ${error.message}`
    );
  }
}
