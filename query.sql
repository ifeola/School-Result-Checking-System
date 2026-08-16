
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	email text unique,
	password_hash TEXT not null,
	role user_role not null ,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL
);

create TYPE user_role as ENUM ('student', 'teacher', 'admin');

CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID UNIQUE REFERENCES users(id),
	admission_number varchar(50) unique not null,

	first_name varchar(100) not null,
	last_name varchar(100) not null,
	middle_name varchar(100),

	gender varchar(10) not null check(gender in ('male', 'female')),
	date_of_birth DATE,

	parent_name varchar(255),
	parent_phone varchar(20),

	current_status VARCHAR(20) CHECK (current_status IN ('active', 'graduated', 'withdrawn')),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID UNIQUE REFERENCES users(id),

    teacher_number VARCHAR(50) UNIQUE,

    first_name VARCHAR(100),
    last_name VARCHAR(100),

    phone VARCHAR(20),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY,

    user_id UUID UNIQUE REFERENCES users(id),

    full_name VARCHAR(255),

    permission_level VARCHAR(20) CHECK (permission_level IN ('super_admin', 'staff_admin'))
);

CREATE TABLE IF NOT EXISTS academic_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    session_name VARCHAR(20) UNIQUE NOT NULL,

    starts_on DATE,
    ends_on DATE,

    is_current BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    session_id UUID REFERENCES academic_sessions(id),

    term_name VARCHAR(20)
    CHECK (term_name IN ('First Term', 'Second Term', 'Third Term')),

    starts_on DATE,
    ends_on DATE
);

CREATE TABLE IF NOT EXISTS department_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    department_id UUID REFERENCES departments(id),

    subject_id UUID REFERENCES subjects(id)
);

CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    class_name VARCHAR(20) UNIQUE NOT NULL,

    level VARCHAR(20)
    CHECK (level IN ('junior', 'senior'))
);

CREATE TABLE IF NOT EXISTS student_class_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    student_id UUID REFERENCES students(id),

    class_id UUID REFERENCES classes(id),

    session_id UUID REFERENCES academic_sessions(id),
    department_id UUID REFERENCES departments(id),

    promoted_to_next_class BOOLEAN DEFAULT FALSE,
    repeated_class BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    subject_name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS class_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    class_id UUID REFERENCES classes(id),

    subject_id UUID REFERENCES subjects(id)
);

CREATE TABLE IF NOT EXISTS teacher_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    teacher_id UUID REFERENCES teachers(id),

    class_id UUID REFERENCES classes(id),

    subject_id UUID REFERENCES subjects(id),

    session_id UUID REFERENCES academic_sessions(id)
);

CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    student_id UUID REFERENCES students(id),

    class_id UUID REFERENCES classes(id),

    subject_id UUID REFERENCES subjects(id),

    term_id UUID REFERENCES terms(id),

    test_score DECIMAL(5,2) DEFAULT 0,

    assignment_score DECIMAL(5,2) DEFAULT 0,

    exam_score DECIMAL(5,2) DEFAULT 0,
    total_score DECIMAL(5,2),
    grade VARCHAR(2),
    remark VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);