const Grade = require('../models/Grade ');
const Student = require('../models/Student');
const Course = require('../models/Course ');
const Notify = require('../models/Notifications');


exports.getStudentsGrade = (req, res) => {
    Grade.find({ student: req.params.studentId })
        .populate('course', 'name semester courseId instructor')
        .populate('student', 'name studentId')
        .then((data) => {
            if (!data) res.status(401).json({ message: 'data not found' })
            res.json({ data })
        })
        .catch((err) => {
            res.status(500).json({ err });
        })

}


exports.getGrades = (req, res) => {
    Grade.find()
        .populate('student', 'name studentId')
        .populate('course', 'name semester courseId instructor')
        .then((data) => {
            if (!data) res.status(401).json({ message: 'data not found' })
            res.json({ data })
        })
        .catch((err) => {
            res.status(500).json({ err });
        })

}

exports.addGrade = async (req, res) => {
    const { student, course, grade } = req.body;

    try {
        // Check if grade already exists
        const existing = await Grade.findOne({ student, course });
        if (existing) {
            return res.status(400).json({ message: 'This course was already entered!' });
        }

        // Save the new grade
        await new Grade(req.body).save();

        const credit = await Course.findById(course);

        if (grade < 1.0) { } else {
            const st = await Student.findByIdAndUpdate(
                student,
                { $inc: { totalCredits: credit.creditHours } },  // ✅ safely increment
                { new: true }
            );
            await new Notify({
                title: "Course Completed",
                description: `Student ${st.name} has completed the course ${credit.name} and his grade is ${grade}.`
            }).save();
        }

        return res.json({ message: 'Grade added successfully!' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Something went wrong.', details: err.message });
    }
};


exports.updateGrade = async (req, res) => {
    try {
        const updatedGrade = await Grade.findByIdAndUpdate(req.params.gradeId, req.body, { new: true })
            .populate('student', 'name studentId')
            .populate('course', 'name semester courseId instructor creditHours');

        if (!updatedGrade) {
            return res.status(404).json({ message: 'Grade not found' });
        }

        const creditHours = updatedGrade.course.creditHours;
        const studentId = updatedGrade.student._id;

        // Update student's total credits
        if (req.body.grade < 1.0) {
            await Student.findByIdAndUpdate(
                studentId,
                { $inc: { totalCredits: -creditHours } },
                { new: true }
            );
        } else {
            await Student.findByIdAndUpdate(
                studentId,
                { $inc: { totalCredits: creditHours } },
                { new: true }
            );
        }

        // Save a notification
        await new Notify({
            title: "Grade Updated",
            description: `Grade for student ${updatedGrade.student.name} in course ${updatedGrade.course.name} has been updated to ${updatedGrade.grade}.`
        }).save();

        res.json({ message: 'Grade info updated successfully!', data: updatedGrade });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};




exports.deleteGrade = (req, res) => {
    Grade.findByIdAndDelete(req.params.gradeId)
        .then((data) => {
            if (data) {
                new Notify({
                    title: "Grade Deleted",
                    description: `Grade for student ${data.student.name} in course ${data.course.name} has been deleted.`
                }).save();
                res.json({ message: 'grade deleted successfully!' });
            } else {
                res.status(400).json({ message: 'grade not found' })
            }
        })
        .catch((err) => {
            res.status(500).json({ err });
        })
}


exports.calculateGrade = (req, res) => {
    Grade.find({ student: req.params.studentId })
        .populate('course', 'name semester courseId instructor creditHours')
        .populate('student', 'name studentId')
        .then(data => {
            if (!data || data.length === 0) {
                return res.status(404).json({ message: 'No grades found for this student.' });
            }

            let totalPoints = 0;
            let totalHours = 0;

            data.forEach(g => {
                const credit = g.course.creditHours || 0;
                totalPoints += g.grade * credit;
                totalHours += credit;
            });

            const gpa = totalHours > 0 ? totalPoints / totalHours : 0;

            res.json({
                student: data[0].student.name,
                studentId: data[0].student.studentId,
                GPA: gpa.toFixed(2),
            });
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
};


