'use strict';

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Configure multer consistently with server.js
const upload = multer({
    storage: multer.diskStorage({
        destination: path.join(__dirname, '../../Uploads'),
        filename: (req, file, cb) => {
            const filename = `${uuidv4()}${path.extname(file.originalname)}`;
            console.log('Uploading file:', filename);
            cb(null, filename);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
            console.log('File type rejected:', file.mimetype);
            return cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
        }
        cb(null, true);
    },
});

module.exports = function (TdCourse) {
    // Update course remote method
    TdCourse.updateCourse = function (id, req, res, cb) {
        upload.fields([
            { name: 'coverImage', maxCount: 1 },
            { name: 'instructorProfileImage', maxCount: 1 },
        ])(req, res, async function (err) {
            if (err) {
                console.error('Multer error during course update:', err.message);
                return cb(new Error(`File upload error: ${err.message}`));
            }

            try {
                const Course = TdCourse.app.models.TdCourse;
                const course = await Course.findById(id);

                if (!course) {
                    return cb(new Error('Course not found'));
                }

                const body = req.body;
                const files = req.files;

                const updateData = {
                    courseName: body.courseName || course.courseName,
                    subTitle: body.subTitle || course.subTitle,
                    description: body.description || course.description,
                    pricing: Number(body.pricing) || course.pricing,
                    language: body.language || course.language,
                    duration: body.duration || course.duration,
                    level: body.level || course.level,
                    instructorName: body.instructorName || course.instructorName,
                    rating: Number(body.rating) || course.rating,
                    totalRatings: Number(body.totalRatings) || course.totalRatings,
                    enrollments: Number(body.enrollments) || course.enrollments,
                    tags: body.tags ? JSON.parse(body.tags) : course.tags,
                    isFeatured: body.isFeatured === 'true' || course.isFeatured,
                    isPublished: body.isPublished === 'true' || course.isPublished,
                    modules: body.modules ? JSON.parse(body.modules) : course.modules,
                    updatedAt: new Date(),
                };

                // Handle coverImage
                if (files.coverImage && files.coverImage.length > 0) {
                    const file = files.coverImage[0];
                    updateData.coverImage = `${file.filename}`;
                }

                // Handle instructorProfileImage
                if (files.instructorProfileImage && files.instructorProfileImage.length > 0) {
                    const file = files.instructorProfileImage[0];
                    updateData.instructorProfileImage = `${file.filename}`;
                }

                await Course.updateAll({ id }, updateData);
                const updatedCourse = await Course.findById(id);

                cb(null, {
                    message: 'Course updated successfully!',
                    course: updatedCourse,
                });
            } catch (error) {
                console.error('Update course error:', error.message);
                cb(new Error(`Failed to update course: ${error.message}`));
            }
        });
    };

    TdCourse.remoteMethod('updateCourse', {
        http: { path: '/updateWithFiles/:id', verb: 'patch' },
        accepts: [
            { arg: 'id', type: 'string', required: true },
            { arg: 'req', type: 'object', http: { source: 'req' } },
            { arg: 'res', type: 'object', http: { source: 'res' } },
        ],
        returns: { arg: 'data', type: 'object', root: true },
    });

    // Create course remote method
    TdCourse.createCourse = function (req, res, cb) {
        upload.fields([
            { name: 'coverImage', maxCount: 1 },
            { name: 'instructorProfileImage', maxCount: 1 },
        ])(req, res, async function (err) {
            if (err) {
                console.error('Multer error during course creation:', err.message);
                return cb(new Error(`File upload error: ${err.message}`));
            }

            try {
                const Course = TdCourse.app.models.TdCourse;
                const body = req.body;
                const files = req.files;

                const courseData = {
                    courseName: body.courseName,
                    subTitle: body.subTitle || undefined,
                    description: body.description || undefined,
                    pricing: Number(body.pricing) || 0,
                    language: body.language || 'English',
                    duration: body.duration || undefined,
                    level: body.level || undefined,
                    instructorName: body.instructorName || undefined,
                    rating: Number(body.rating) || 0,
                    totalRatings: Number(body.totalRatings) || 0,
                    enrollments: Number(body.enrollments) || 0,
                    tags: body.tags ? JSON.parse(body.tags) : [],
                    isFeatured: body.isFeatured === 'true' || false,
                    isPublished: body.isPublished === 'true' || false,
                    modules: body.modules ? JSON.parse(body.modules) : [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                // Handle coverImage
                if (files.coverImage && files.coverImage.length > 0) {
                    const file = files.coverImage[0];
                    courseData.coverImage = `${file.filename}`;
                }

                // Handle instructorProfileImage
                if (files.instructorProfileImage && files.instructorProfileImage.length > 0) {
                    const file = files.instructorProfileImage[0];
                    courseData.instructorProfileImage = `${file.filename}`;
                }

                const newCourse = await Course.create(courseData);

                cb(null, {
                    message: 'Course created successfully!',
                    course: newCourse,
                });
            } catch (error) {
                console.error('Create course error:', error.message);
                cb(new Error(`Failed to create course: ${error.message}`));
            }
        });
    };

    TdCourse.remoteMethod('createCourse', {
        http: { path: '/createWithFiles', verb: 'post' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' } },
            { arg: 'res', type: 'object', http: { source: 'res' } },
        ],
        returns: { arg: 'data', type: 'object', root: true },
    });
};