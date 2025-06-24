// src/hooks/useCourses.js
import { useSelector, useDispatch } from 'react-redux';
import { addCourse, deleteCourse, updateCourse } from '@/redux/courseSlice';
import { useCallback } from 'react';

export function useCourses() {
    const dispatch = useDispatch();
    const courses = useSelector((state) => state.courses.list);

    const add = useCallback((course) => dispatch(addCourse(course)), [dispatch]);
    const update = useCallback((id, data) => dispatch(updateCourse({ id, data })), [dispatch]);
    const remove = useCallback((id) => dispatch(deleteCourse(id)), [dispatch]);

    return { courses, add, update, remove };
}
