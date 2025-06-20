const Student = require('../models/Student');
const Department = require('../models/Department');
const Notify = require('../models/Notifications');

exports.getAllStudents = async (req, res) => {
    const departments = await Department.find({ category: req.user.departmentCategory });
    const departmentId = departments.map(dep => dep._id);

    await Student.find({ department: { $in: departmentId } })
    .populate('department', 'name code category')
    .then(data => {
        res.json({ data });
    })
        .catch(err => {
            res.status(500).json({ message: 'somthing went wrong' + err });
        })

}


exports.getStudentByID = async (req, res) => {
    await Student.findById(req.params.id)
    .populate('department', 'name code category')
    .then(data => {
        res.json({ data });
    })
        .catch(err => {
            res.status(500).json({ message: 'somthing went wrong' + err });
        })

}

exports.addStudent = async (req, res) => {
    await new Student(req.body).save()
        .then((data) => {
            new Notify({
                title: "Student Added",
                description: `Student ${data.name} has been added to the system.`
            }).save();
            res.json({ message: 'student added successfully!' })

        })
        .catch((err) => {
            res.status(500).json({ error: err })
        })

}

exports.updateInfo = async (req, res) => {
    await Student.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .then(data => {
            new Notify({
                title: "Student Info Updated",
                description: `Information for student ${data.name} has been updated.`
            }).save();
            res.json({ message: 'student info updated successfully!', data });
        })
        .catch((err) => {
            res.status(500).json({ err });
        })
}

exports.deleteStudent = async (req, res) => {
    await Student.findByIdAndDelete(req.params.id)
        .then((data) => {
            new Notify({
                title: "Student Deleted",
                description: `Student ${data.name} has been removed from the system.`
            }).save();
            res.json({ message: 'student deleted successfully!' });
        })
        .catch((err) => {
            res.status(500).json({ err });
        })
}