import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/userModel.js';
import Doctor from '../models/doctorModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory path for the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to read MongoDB URI from .env file
let MONGODB_URI;

try {
    const envPath = path.resolve(__dirname, '../.env');
    console.log(`Looking for .env file at: ${envPath}`);

    if (fs.existsSync(envPath)) {
        console.log('.env file found');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const mongoMatch = envContent.match(/MONGO_URI\s*=\s*(.+)/);

        if (mongoMatch && mongoMatch[1]) {
            MONGODB_URI = mongoMatch[1].trim();
            console.log(`Found MongoDB URI in .env file: ${MONGODB_URI}`);
        } else {
            console.log('MONGO_URI not found in .env file');
        }
    } else {
        console.log('.env file not found');
    }
} catch (err) {
    console.log(`Error reading .env file: ${err.message}`);
}

// If no MongoDB URI found in .env, use a default
// if (!MONGODB_URI) {
//     // Hardcoded MongoDB Atlas connection string from your .env file as backup
//    
//     console.log('Using hardcoded MongoDB Atlas connection string as fallback');
// }

console.log(`Attempting to connect to MongoDB at: ${MONGODB_URI.substring(0, 25)}...`);

// Connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

// Generate random available slots
const generateAvailableSlots = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const availableSlots = [];

    days.forEach(day => {
        const slots = [];
        // Morning slots
        for (let hour = 9; hour < 12; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00-${hour.toString().padStart(2, '0')}:30`);
            slots.push(`${hour.toString().padStart(2, '0')}:30-${(hour + 1).toString().padStart(2, '0')}:00`);
        }
        // Afternoon slots
        for (let hour = 14; hour < 17; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00-${hour.toString().padStart(2, '0')}:30`);
            slots.push(`${hour.toString().padStart(2, '0')}:30-${(hour + 1).toString().padStart(2, '0')}:00`);
        }
        availableSlots.push({ day, slots });
    });

    return availableSlots;
};

// Sample doctor data
const doctors = [
    // Cardiology
    {
        name: "John Smith",
        email: "john.smith@example.com",
        password: "Password123",
        specialty: "Cardiology",
        qualifications: ["MD", "FACC", "Board Certified in Cardiovascular Disease"],
        experience: 15,
        bio: "Dr. John Smith is a cardiologist with over 15 years of experience specializing in heart failure, coronary artery disease, and cardiac imaging. He completed his fellowship at Cleveland Clinic and is dedicated to providing comprehensive cardiovascular care.",
        consultationFee: 150,
        ratings: { average: 4.8, count: 120 }
    },
    {
        name: "Sarah Johnson",
        email: "sarah.johnson@example.com",
        password: "Password123",
        specialty: "Cardiology",
        qualifications: ["MD", "PhD", "FACC"],
        experience: 12,
        bio: "Dr. Sarah Johnson specializes in interventional cardiology and structural heart disease. She is experienced in performing complex coronary interventions and has conducted research on innovative treatments for heart valve disorders.",
        consultationFee: 175,
        ratings: { average: 4.7, count: 89 }
    },

    // Dermatology
    {
        name: "Michael Chen",
        email: "michael.chen@example.com",
        password: "Password123",
        specialty: "Dermatology",
        qualifications: ["MD", "FAAD", "Board Certified in Dermatology"],
        experience: 10,
        bio: "Dr. Michael Chen is a board-certified dermatologist specializing in medical, surgical, and cosmetic dermatology. He has expertise in treating skin cancer, acne, psoriasis, and other skin conditions.",
        consultationFee: 130,
        ratings: { average: 4.9, count: 156 }
    },
    {
        name: "Emma Rodriguez",
        email: "emma.rodriguez@example.com",
        password: "Password123",
        specialty: "Dermatology",
        qualifications: ["MD", "FAAD"],
        experience: 8,
        bio: "Dr. Emma Rodriguez focuses on pediatric dermatology and cosmetic procedures. She is known for her gentle approach and is experienced in treating various skin conditions including eczema, dermatitis, and adolescent acne.",
        consultationFee: 140,
        ratings: { average: 4.8, count: 92 }
    },

    // Endocrinology
    {
        name: "David Williams",
        email: "david.williams@example.com",
        password: "Password123",
        specialty: "Endocrinology",
        qualifications: ["MD", "FACE", "PhD in Endocrinology"],
        experience: 18,
        bio: "Dr. David Williams is an endocrinologist specializing in diabetes management, thyroid disorders, and metabolic syndromes. With over 18 years of experience, he takes a patient-centered approach to hormonal health.",
        consultationFee: 160,
        ratings: { average: 4.6, count: 78 }
    },
    {
        name: "Patricia Lee",
        email: "patricia.lee@example.com",
        password: "Password123",
        specialty: "Endocrinology",
        qualifications: ["MD", "FACE"],
        experience: 14,
        bio: "Dr. Patricia Lee specializes in treating adrenal disorders, pituitary conditions, and osteoporosis. She is dedicated to helping patients with complex hormonal imbalances and has published extensively on endocrine disorders.",
        consultationFee: 155,
        ratings: { average: 4.7, count: 110 }
    },

    // Gastroenterology
    {
        name: "Robert Garcia",
        email: "robert.garcia@example.com",
        password: "Password123",
        specialty: "Gastroenterology",
        qualifications: ["MD", "FACG", "Board Certified in Gastroenterology"],
        experience: 20,
        bio: "Dr. Robert Garcia is a gastroenterologist with expertise in digestive disorders, inflammatory bowel disease, and advanced endoscopic procedures. He is skilled in diagnosing and treating complex GI conditions.",
        consultationFee: 165,
        ratings: { average: 4.8, count: 134 }
    },
    {
        name: "Jennifer Kim",
        email: "jennifer.kim@example.com",
        password: "Password123",
        specialty: "Gastroenterology",
        qualifications: ["MD", "FACG", "PhD"],
        experience: 16,
        bio: "Dr. Jennifer Kim specializes in hepatology and liver diseases. She has conducted extensive research on viral hepatitis and non-alcoholic fatty liver disease, and is committed to comprehensive patient education and care.",
        consultationFee: 170,
        ratings: { average: 4.9, count: 98 }
    },

    // Neurology
    {
        name: "Thomas Moore",
        email: "thomas.moore@example.com",
        password: "Password123",
        specialty: "Neurology",
        qualifications: ["MD", "FAAN", "Board Certified in Neurology"],
        experience: 22,
        bio: "Dr. Thomas Moore is a neurologist specializing in movement disorders, Parkinson's disease, and neurodegenerative conditions. With over 20 years of experience, he combines the latest research with compassionate care.",
        consultationFee: 180,
        ratings: { average: 4.7, count: 115 }
    },
    {
        name: "Lisa Wang",
        email: "lisa.wang@example.com",
        password: "Password123",
        specialty: "Neurology",
        qualifications: ["MD", "FAAN", "PhD in Neuroscience"],
        experience: 17,
        bio: "Dr. Lisa Wang focuses on headache disorders, epilepsy, and multiple sclerosis. She takes a holistic approach to neurological care and is involved in clinical trials for innovative treatments in neurology.",
        consultationFee: 175,
        ratings: { average: 4.8, count: 87 }
    },

    // Oncology
    {
        name: "Richard Brown",
        email: "richard.brown@example.com",
        password: "Password123",
        specialty: "Oncology",
        qualifications: ["MD", "PhD", "Board Certified in Medical Oncology"],
        experience: 25,
        bio: "Dr. Richard Brown is an oncologist with extensive experience in treating various types of cancer. He specializes in precision medicine approaches and has led numerous clinical trials for novel cancer therapies.",
        consultationFee: 200,
        ratings: { average: 4.9, count: 142 }
    },
    {
        name: "Sophia Martinez",
        email: "sophia.martinez@example.com",
        password: "Password123",
        specialty: "Oncology",
        qualifications: ["MD", "FASCO"],
        experience: 19,
        bio: "Dr. Sophia Martinez specializes in breast and gynecologic cancers. She is committed to providing personalized cancer care and is known for her compassionate approach to patient support throughout the treatment journey.",
        consultationFee: 190,
        ratings: { average: 4.8, count: 128 }
    },

    // Orthopedics
    {
        name: "William Taylor",
        email: "william.taylor@example.com",
        password: "Password123",
        specialty: "Orthopedics",
        qualifications: ["MD", "FAAOS", "Board Certified in Orthopedic Surgery"],
        experience: 18,
        bio: "Dr. William Taylor is an orthopedic surgeon specializing in sports medicine and joint replacement. He has worked with professional athletes and uses minimally invasive techniques for faster recovery times.",
        consultationFee: 185,
        ratings: { average: 4.7, count: 156 }
    },
    {
        name: "Olivia Wilson",
        email: "olivia.wilson@example.com",
        password: "Password123",
        specialty: "Orthopedics",
        qualifications: ["MD", "FAAOS"],
        experience: 14,
        bio: "Dr. Olivia Wilson focuses on spine surgery and treating complex back disorders. She is committed to exploring non-surgical options first and uses advanced techniques when surgery is necessary.",
        consultationFee: 175,
        ratings: { average: 4.6, count: 102 }
    },

    // Pediatrics
    {
        name: "James Anderson",
        email: "james.anderson@example.com",
        password: "Password123",
        specialty: "Pediatrics",
        qualifications: ["MD", "FAAP", "Board Certified in Pediatrics"],
        experience: 15,
        bio: "Dr. James Anderson is a pediatrician dedicated to providing comprehensive care for children from infancy through adolescence. He specializes in developmental disorders and preventive healthcare for children.",
        consultationFee: 120,
        ratings: { average: 4.9, count: 183 }
    },
    {
        name: "Maria Gonzalez",
        email: "maria.gonzalez@example.com",
        password: "Password123",
        specialty: "Pediatrics",
        qualifications: ["MD", "FAAP", "PhD in Child Development"],
        experience: 12,
        bio: "Dr. Maria Gonzalez specializes in pediatric allergies and respiratory conditions. She takes a family-centered approach to care and is particularly skilled at working with children with special healthcare needs.",
        consultationFee: 125,
        ratings: { average: 4.8, count: 145 }
    },

    // Psychiatry
    {
        name: "Daniel Thompson",
        email: "daniel.thompson@example.com",
        password: "Password123",
        specialty: "Psychiatry",
        qualifications: ["MD", "FAPA", "Board Certified in Psychiatry"],
        experience: 20,
        bio: "Dr. Daniel Thompson is a psychiatrist specializing in mood disorders, anxiety, and PTSD. He combines medication management with therapy approaches and is committed to destigmatizing mental health care.",
        consultationFee: 170,
        ratings: { average: 4.7, count: 91 }
    },
    {
        name: "Elizabeth Park",
        email: "elizabeth.park@example.com",
        password: "Password123",
        specialty: "Psychiatry",
        qualifications: ["MD", "FAPA", "PhD in Clinical Psychology"],
        experience: 16,
        bio: "Dr. Elizabeth Park focuses on child and adolescent psychiatry. She has expertise in ADHD, autism spectrum disorders, and early intervention for various mental health conditions affecting young people.",
        consultationFee: 165,
        ratings: { average: 4.8, count: 76 }
    },

    // Urology
    {
        name: "Christopher Adams",
        email: "christopher.adams@example.com",
        password: "Password123",
        specialty: "Urology",
        qualifications: ["MD", "FACS", "Board Certified in Urology"],
        experience: 19,
        bio: "Dr. Christopher Adams is a urologist specializing in urologic oncology, kidney stones, and men's health issues. He utilizes the latest minimally invasive techniques for better patient outcomes.",
        consultationFee: 160,
        ratings: { average: 4.7, count: 118 }
    },
    {
        name: "Nancy Lewis",
        email: "nancy.lewis@example.com",
        password: "Password123",
        specialty: "Urology",
        qualifications: ["MD", "FACS"],
        experience: 15,
        bio: "Dr. Nancy Lewis focuses on female urology and pelvic floor disorders. She is dedicated to addressing women's urological health concerns with sensitivity and has pioneered several treatment approaches.",
        consultationFee: 155,
        ratings: { average: 4.8, count: 89 }
    }
];

// Function to seed doctors
const seedDoctors = async () => {
    try {
        // Connect to the database
        await connectDB();

        // Clear existing data
        console.log('Clearing existing doctor data...');
        await User.deleteMany({ role: 'doctor' });
        await Doctor.deleteMany({});
        console.log('Previous doctor data cleared.');

        for (const doctorData of doctors) {
            // Create user first
            const hashedPassword = await bcrypt.hash(doctorData.password, 10);
            const user = new User({
                name: doctorData.name,
                email: doctorData.email,
                password: hashedPassword,
                role: 'doctor'
            });

            const savedUser = await user.save();
            console.log(`Created user for Dr. ${doctorData.name}`);

            // Create doctor profile
            const doctor = new Doctor({
                user: savedUser._id,
                specialty: doctorData.specialty,
                qualifications: doctorData.qualifications,
                experience: doctorData.experience,
                bio: doctorData.bio,
                consultationFee: doctorData.consultationFee,
                availableSlots: generateAvailableSlots(),
                ratings: {
                    average: doctorData.ratings.average,
                    count: doctorData.ratings.count
                }
            });

            await doctor.save();
            console.log(`Created doctor profile for Dr. ${doctorData.name} (${doctorData.specialty})`);
        }

        console.log('Doctor seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding doctors:', error);
        process.exit(1);
    }
};

seedDoctors();