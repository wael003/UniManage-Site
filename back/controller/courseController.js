const Course = require('../models/Course ');
const Department = require('../models/Department');
const Notify = require('../models/Notifications');
const socket = require('../config/Socket')

exports.getAllCourses = async (req, res) => {
    const departments = await Department.find({ category: req.user.departmentCategory });
    const departmentId = departments.map(dep => dep._id);
    await Course.find({ department: { $in: departmentId } })
        .populate('department', 'name code category')
        .then(data => {
            res.json({ data });
        })
        .catch(err => {
            res.status(500).json({ message: 'somthing went wrong' + err });
        })

}


exports.getCourseByCode = async (req, res) => {
    await Course.findOne({ courseId: req.params.code })
        .then(data => {
            if (data) {
                res.json({ data });
            } else {
                res.status(400).json({ message: 'no data found' });
            }
        })
        .catch(err => {
            res.status(500).json({ message: 'somthing went wrong' + err });
        })

}

exports.addCourse = async (req, res) => {
    const departments = await Department.find({ category: req.user.departmentCategory });
    const departmentId = departments.map(dep => dep._id);
    new Course(req.body).save()
        .then((data) => {
            new Notify({
                title: "New Course add",
                description: `Course number ${data.courseId} has added to the list.`,
                department: departmentId[0]
            }).save()
                .then((data) => {
                    const io = req.app.get('io');

                    io.to(departmentId[0].toString()).emit('notify', {
                        title: data.title,
                        description: data.description,
                        date: data.date
                    });

                })
                .catch(err => {
                    console.log(err);
                })
            res.json(data);
        })
        .catch((err) => {
            res.status(500).json({ error: err })
        })

}

exports.updateInfo = async (req, res) => {
    const departments = await Department.find({ category: req.user.departmentCategory });
    const departmentId = departments.map(dep => dep._id);
    await Course.findOneAndUpdate({ courseId: req.params.code }, req.body, { new: true })
        .then(data => {
            new Notify({
                title: "Course Info Change",
                description: `Course number ${data.courseId} has Updated.`,
                department: departmentId[0]
            }).save()
                .then((data) => {
                    const io = req.app.get('io');

                     io.to(departmentId[0].toString()).emit('notify', {
                        title: data.title,
                        description: data.description,
                        date: data.date
                    });
                })
                .catch(err => {
                    console.log(err);
                })

            res.json({ message: 'course info updated successfully!', data });
        })
        .catch((err) => {
            res.status(500).json({ err });
        })
}

exports.deleteCourse = async (req, res) => {
    const departments = await Department.find({ category: req.user.departmentCategory });
    const departmentId = departments.map(dep => dep._id);

    await Course.findOneAndDelete({ courseId: req.params.code })
        .then((data) => {
            if (data) {
                new Notify({
                    title: "Course Deleted",
                    description: `Course number ${data.courseId} has been deleted.`,
                    department: departmentId[0]

                }).save()
                    .then((data) => {
                        const io = req.app.get('io');

                         io.to(departmentId[0].toString()).emit('notify', {
                        title: data.title,
                        description: data.description,
                        date: data.date
                    });
                    })
                    .catch(err => {
                        console.log(err);
                    })
                res.json({ message: 'course deleted successfully!' });
            } else {
                res.status(400).json({ message: 'course not found' })
            }
        })
        .catch((err) => {
            res.status(500).json({ err });
        })
}