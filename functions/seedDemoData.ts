import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Check if demo data already exists
    const existingSchools = await base44.asServiceRole.entities.School.filter({ name: 'Riverside International School' });
    if (existingSchools.length > 0) {
      return Response.json({ 
        message: 'Demo data already exists',
        schoolId: existingSchools[0].id,
        warning: 'Delete existing school data first to reseed'
      });
    }

    // Create demo school
    const school = await base44.asServiceRole.entities.School.create({
      name: 'Riverside International School',
      slug: 'riverside-intl',
      country: 'Switzerland',
      city: 'Geneva',
      address: '123 International Avenue, Geneva',
      email: 'admin@riverside.edu',
      phone: '+41 22 123 4567',
      plan: 'professional',
      status: 'active',
      timezone: 'Europe/Zurich',
      modules_enabled: ['attendance', 'behavior', 'cas', 'ee', 'tok', 'timetable', 'messaging'],
      academic_year_start_month: 9,
      billing_status: 'active',
    });

    // Create academic year
    const academicYear = await base44.asServiceRole.entities.AcademicYear.create({
      school_id: school.id,
      name: '2024-2025',
      start_date: '2024-09-01',
      end_date: '2025-06-30',
      is_current: true,
    });

    // Create terms
    const term1 = await base44.asServiceRole.entities.Term.create({
      school_id: school.id,
      academic_year_id: academicYear.id,
      name: 'Term 1',
      start_date: '2024-09-01',
      end_date: '2024-12-20',
      is_current: false,
    });

    const term2 = await base44.asServiceRole.entities.Term.create({
      school_id: school.id,
      academic_year_id: academicYear.id,
      name: 'Term 2',
      start_date: '2025-01-06',
      end_date: '2025-03-28',
      is_current: true,
    });

    // Create subjects
    const subjects = await Promise.all([
      base44.asServiceRole.entities.Subject.create({
        school_id: school.id,
        name: 'English Literature',
        code: 'EN001',
        is_ib: true,
        ib_group: 1,
      }),
      base44.asServiceRole.entities.Subject.create({
        school_id: school.id,
        name: 'Mathematics',
        code: 'MA001',
        is_ib: true,
        ib_group: 5,
      }),
      base44.asServiceRole.entities.Subject.create({
        school_id: school.id,
        name: 'Physics',
        code: 'PH001',
        is_ib: true,
        ib_group: 4,
      }),
      base44.asServiceRole.entities.Subject.create({
        school_id: school.id,
        name: 'History',
        code: 'HI001',
        is_ib: true,
        ib_group: 3,
      }),
    ]);

    // Create periods
    const periods = await Promise.all([
      base44.asServiceRole.entities.Period.create({
        school_id: school.id,
        name: 'Period 1',
        start_time: '08:00',
        end_time: '08:50',
        day_of_week: 1,
        period_order: 1,
      }),
      base44.asServiceRole.entities.Period.create({
        school_id: school.id,
        name: 'Period 2',
        start_time: '09:00',
        end_time: '09:50',
        day_of_week: 1,
        period_order: 2,
      }),
      base44.asServiceRole.entities.Period.create({
        school_id: school.id,
        name: 'Period 3',
        start_time: '10:00',
        end_time: '10:50',
        day_of_week: 1,
        period_order: 3,
      }),
    ]);

    // Create rooms
    const rooms = await Promise.all([
      base44.asServiceRole.entities.Room.create({
        school_id: school.id,
        name: 'A101',
        code: 'A101',
        building: 'Building A',
        capacity: 30,
        room_type: 'classroom',
        facilities: ['projector', 'whiteboard', 'computers'],
      }),
      base44.asServiceRole.entities.Room.create({
        school_id: school.id,
        name: 'A102',
        code: 'A102',
        building: 'Building A',
        capacity: 28,
        room_type: 'classroom',
        facilities: ['projector', 'whiteboard'],
      }),
    ]);

    // Create demo users
    const demoUsers = [
      { email: 'alice.johnson@riverside.edu', role: 'school_admin', name: 'Alice Johnson' },
      { email: 'bob.smith@riverside.edu', role: 'ib_coordinator', name: 'Bob Smith' },
      { email: 'carol.white@riverside.edu', role: 'teacher', name: 'Carol White' },
      { email: 'david.green@riverside.edu', role: 'teacher', name: 'David Green' },
      { email: 'emma.brown@riverside.edu', role: 'student', name: 'Emma Brown' },
      { email: 'frank.davis@riverside.edu', role: 'student', name: 'Frank Davis' },
      { email: 'grace.lee@riverside.edu', role: 'student', name: 'Grace Lee' },
      { email: 'henry.wilson@riverside.edu', role: 'parent', name: 'Henry Wilson' },
      { email: 'iris.miller@riverside.edu', role: 'parent', name: 'Iris Miller' },
    ];

    const createdUsers = await Promise.all(
      demoUsers.map(u => 
        base44.asServiceRole.entities.SchoolMembership.create({
          school_id: school.id,
          user_email: u.email,
          user_name: u.name,
          role: u.role,
        })
      )
    );

    const userMap = {};
    demoUsers.forEach((u, i) => {
      userMap[u.role] = userMap[u.role] || [];
      userMap[u.role].push(createdUsers[i]);
    });

    // Create classes
    const classes = await Promise.all([
      base44.asServiceRole.entities.Class.create({
        school_id: school.id,
        name: 'IB DP Year 1',
        code: 'DP1A',
        section: 'A',
        teacher_ids: [userMap.teacher[0].id, userMap.teacher[1].id],
        student_ids: [userMap.student[0].id, userMap.student[1].id, userMap.student[2].id],
        academic_year_id: academicYear.id,
      }),
    ]);

    const classData = classes[0];

    // Create schedule entries
    await Promise.all([
      base44.asServiceRole.entities.ScheduleEntry.create({
        school_id: school.id,
        class_id: classData.id,
        class_name: classData.name,
        teacher_id: userMap.teacher[0].id,
        teacher_name: userMap.teacher[0].user_name,
        room_id: rooms[0].id,
        room_name: rooms[0].name,
        period_id: periods[0].id,
        day_of_week: 1,
        start_time: '08:00',
        end_time: '08:50',
        academic_year_id: academicYear.id,
      }),
      base44.asServiceRole.entities.ScheduleEntry.create({
        school_id: school.id,
        class_id: classData.id,
        class_name: classData.name,
        teacher_id: userMap.teacher[1].id,
        teacher_name: userMap.teacher[1].user_name,
        room_id: rooms[1].id,
        room_name: rooms[1].name,
        period_id: periods[1].id,
        day_of_week: 2,
        start_time: '09:00',
        end_time: '09:50',
        academic_year_id: academicYear.id,
      }),
    ]);

    // Create parent-student links
    await Promise.all([
      base44.asServiceRole.entities.ParentStudentLink.create({
        school_id: school.id,
        parent_id: userMap.parent[0].id,
        parent_name: userMap.parent[0].user_name,
        student_id: userMap.student[0].id,
        student_name: userMap.student[0].user_name,
        relationship: 'father',
      }),
      base44.asServiceRole.entities.ParentStudentLink.create({
        school_id: school.id,
        parent_id: userMap.parent[1].id,
        parent_name: userMap.parent[1].user_name,
        student_id: userMap.student[1].id,
        student_name: userMap.student[1].user_name,
        relationship: 'mother',
      }),
    ]);

    // Create assignments
    const assignment = await base44.asServiceRole.entities.Assignment.create({
      school_id: school.id,
      class_id: classData.id,
      teacher_id: userMap.teacher[0].id,
      title: 'Hamlet Character Analysis Essay',
      description: 'Write a detailed analysis of Hamlet\'s character development throughout the play',
      type: 'essay',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      publish_date: new Date().toISOString(),
      max_score: 100,
      status: 'published',
      primary_submission_format: 'google_doc',
    });

    // Create submissions
    await Promise.all([
      base44.asServiceRole.entities.Submission.create({
        school_id: school.id,
        assignment_id: assignment.id,
        class_id: classData.id,
        student_id: userMap.student[0].id,
        student_name: userMap.student[0].user_name,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        score: 87,
        feedback: 'Excellent analysis. Your interpretation of Hamlet\'s madness is insightful.',
        graded_at: new Date().toISOString(),
      }),
      base44.asServiceRole.entities.Submission.create({
        school_id: school.id,
        assignment_id: assignment.id,
        class_id: classData.id,
        student_id: userMap.student[1].id,
        student_name: userMap.student[1].user_name,
        status: 'draft',
        content: 'Work in progress...',
      }),
    ]);

    // Create grade items
    await Promise.all([
      base44.asServiceRole.entities.GradeItem.create({
        school_id: school.id,
        class_id: classData.id,
        student_id: userMap.student[0].id,
        student_name: userMap.student[0].user_name,
        title: 'Term 2 Midterm Exam',
        score: 82,
        max_score: 100,
        percentage: 82,
        ib_grade: 6,
        status: 'published',
        visible_to_student: true,
        visible_to_parent: true,
        term_id: term2.id,
      }),
      base44.asServiceRole.entities.GradeItem.create({
        school_id: school.id,
        class_id: classData.id,
        student_id: userMap.student[1].id,
        student_name: userMap.student[1].user_name,
        title: 'Term 2 Midterm Exam',
        score: 78,
        max_score: 100,
        percentage: 78,
        ib_grade: 5,
        status: 'published',
        visible_to_student: true,
        visible_to_parent: true,
        term_id: term2.id,
      }),
    ]);

    // Create attendance records
    await Promise.all([
      base44.asServiceRole.entities.AttendanceRecord.create({
        school_id: school.id,
        student_id: userMap.student[0].id,
        student_name: userMap.student[0].user_name,
        class_id: classData.id,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'present',
      }),
      base44.asServiceRole.entities.AttendanceRecord.create({
        school_id: school.id,
        student_id: userMap.student[0].id,
        student_name: userMap.student[0].user_name,
        class_id: classData.id,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'late',
        notes: 'Arrived 15 minutes late',
      }),
    ]);

    // Create behavior records
    await Promise.all([
      base44.asServiceRole.entities.BehaviorRecord.create({
        school_id: school.id,
        student_id: userMap.student[0].id,
        student_name: userMap.student[0].user_name,
        recorded_by: userMap.teacher[0].id,
        recorded_by_name: userMap.teacher[0].user_name,
        type: 'positive',
        category: 'participation',
        title: 'Outstanding Class Discussion',
        description: 'Emma provided insightful contributions to today\'s class discussion on Hamlet',
        date: new Date().toISOString().split('T')[0],
        visible_to_student: true,
        visible_to_parent: true,
      }),
      base44.asServiceRole.entities.BehaviorRecord.create({
        school_id: school.id,
        student_id: userMap.student[1].id,
        student_name: userMap.student[1].user_name,
        recorded_by: userMap.teacher[0].id,
        recorded_by_name: userMap.teacher[0].user_name,
        type: 'concern',
        category: 'academic',
        title: 'Incomplete Assignment',
        description: 'Missing draft submission for essay assignment',
        date: new Date().toISOString().split('T')[0],
        severity: 'medium',
        visible_to_parent: true,
      }),
    ]);

    // Create CAS experiences
    await Promise.all([
      base44.asServiceRole.entities.CASExperience.create({
        school_id: school.id,
        student_id: userMap.student[0].id,
        student_name: userMap.student[0].user_name,
        title: 'Community Service - Local Food Bank',
        description: 'Volunteering at the local food bank to help distribute food to families in need',
        cas_strands: ['service'],
        learning_outcomes: ['LO1', 'LO3'],
        start_date: '2024-10-01',
        end_date: '2025-02-28',
        status: 'ongoing',
        hours: 24,
      }),
      base44.asServiceRole.entities.CASExperience.create({
        school_id: school.id,
        student_id: userMap.student[0].id,
        student_name: userMap.student[0].user_name,
        title: 'Debate Club President',
        description: 'Leading the school debate club and organizing tournaments',
        cas_strands: ['activity', 'creativity'],
        learning_outcomes: ['LO2', 'LO4'],
        start_date: '2024-09-15',
        status: 'ongoing',
        hours: 45,
      }),
    ]);

    // Create EE milestone
    await base44.asServiceRole.entities.EEMilestone.create({
      school_id: school.id,
      student_id: userMap.student[0].id,
      student_name: userMap.student[0].user_name,
      supervisor_id: userMap.teacher[0].id,
      supervisor_name: userMap.teacher[0].user_name,
      subject_area: 'Literature',
      research_question: 'How does Shakespeare use language to explore themes of madness in Hamlet?',
      milestone_type: 'initial_proposal',
      due_date: '2025-03-15',
      submission_date: new Date().toISOString(),
      status: 'approved',
      student_notes: 'Excited to start exploring this topic',
      supervisor_feedback: 'Excellent research question. Well-defined and manageable scope.',
      supervisor_feedback_date: new Date().toISOString(),
    });

    // Create predicted grades
    await Promise.all([
      base44.asServiceRole.entities.PredictedGrade.create({
        school_id: school.id,
        student_id: userMap.student[0].id,
        student_name: userMap.student[0].user_name,
        class_id: classData.id,
        class_name: classData.name,
        subject_id: subjects[0].id,
        subject_name: subjects[0].name,
        teacher_id: userMap.teacher[0].id,
        teacher_name: userMap.teacher[0].user_name,
        predicted_ib_grade: 7,
        confidence_level: 'high',
        rationale: 'Consistent high performance, excellent analytical skills, strong participation',
        academic_year_id: academicYear.id,
        term_id: term2.id,
        visible_to_student: true,
        visible_to_parent: true,
      }),
      base44.asServiceRole.entities.PredictedGrade.create({
        school_id: school.id,
        student_id: userMap.student[1].id,
        student_name: userMap.student[1].user_name,
        class_id: classData.id,
        class_name: classData.name,
        subject_id: subjects[0].id,
        subject_name: subjects[0].name,
        teacher_id: userMap.teacher[0].id,
        teacher_name: userMap.teacher[0].user_name,
        predicted_ib_grade: 5,
        confidence_level: 'medium',
        rationale: 'Needs more consistency with assignments and engagement',
        academic_year_id: academicYear.id,
        term_id: term2.id,
        visible_to_student: true,
        visible_to_parent: true,
      }),
    ]);

    return Response.json({
      success: true,
      message: 'Demo data seeded successfully',
      school: {
        id: school.id,
        name: school.name,
      },
      demoAccounts: demoUsers.map(u => ({
        email: u.email,
        role: u.role,
        name: u.name,
      })),
      stats: {
        users: demoUsers.length,
        classes: 1,
        assignments: 1,
        submissions: 2,
      },
    });
  } catch (error) {
    console.error('Demo data seeding error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});