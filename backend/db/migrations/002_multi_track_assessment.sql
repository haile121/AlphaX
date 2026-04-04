-- Multi-track onboarding: C++ vs Web fundamentals placement tests.
-- Run once against your MySQL database (e.g. amharic_cpp_platform).

ALTER TABLE assessment_questions
  ADD COLUMN track VARCHAR(16) NOT NULL DEFAULT 'cpp';

ALTER TABLE users
  ADD COLUMN primary_track ENUM('cpp', 'web') NULL DEFAULT NULL,
  ADD COLUMN cpp_level VARCHAR(32) NULL DEFAULT NULL,
  ADD COLUMN web_level VARCHAR(32) NULL DEFAULT NULL,
  ADD COLUMN cpp_assessment_completed TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN web_assessment_completed TINYINT(1) NOT NULL DEFAULT 0;

-- Existing learners: treat prior single assessment as C++ primary.
UPDATE users
SET
  cpp_level = level,
  cpp_assessment_completed = 1,
  primary_track = 'cpp'
WHERE assessment_completed = 1;

-- Web fundamentals placement questions (15): 5 beginner + 5 intermediate + 5 advanced.
-- options_json is JSON array of strings; correct_answer must match one option exactly.

INSERT INTO assessment_questions (id, question_en, question_am, options_json, correct_answer, difficulty, track) VALUES
('web-assess-b1', 'What does the HTML <a> element typically represent?', 'የ HTML <a> አካል በተለምዶ ምን ያመለክታል?', '["A paragraph","A hyperlink","A list item","An image"]', 'A hyperlink', 'beginner', 'web'),
('web-assess-b2', 'Which HTML tag defines the largest heading?', 'ትልቁን ርዕስ የሚገልጽ የ HTML መለያ የትኛው ነው?', '["<h6>","<head>","<h1>","<header>"]', '<h1>', 'beginner', 'web'),
('web-assess-b3', 'What does CSS primarily control?', 'CSS በአብዛኛው ምን ይቆጣጠራል?', '["Server logic","How content looks and is laid out","Database queries","Compiler errors"]', 'How content looks and is laid out', 'beginner', 'web'),
('web-assess-b4', 'Where does client-side JavaScript usually run?', 'የ ደንበኛ ጎን JavaScript ብዙውን ጊዜ የት ይሄዳል?', '["Only on the database server","In the web browser","Only in the OS kernel","Inside the CPU cache"]', 'In the web browser', 'beginner', 'web'),
('web-assess-b5', 'Which file extension is most common for an HTML document?', 'ለ HTML ሰነድ በጣም የተለመደ የፋይል ቅጥያ የትኛው ነው?', '[".css",".js",".html",".cpp"]', '.html', 'beginner', 'web'),

('web-assess-i1', 'In CSS, what does margin control?', 'በ CSS ውስጥ margin ምን ይቆጣጠራል?', '["Space outside the border","The font family","The number of columns in a table","CPU scheduling"]', 'Space outside the border', 'intermediate', 'web'),
('web-assess-i2', 'In Flexbox with row direction, which property aligns items along the main axis?', 'በ Flexbox በረድፍ አቅጣጫ፣ ንጥሎችን በዋናው መስመር ላይ የሚያስራው የትኛው ነው?', '["align-items","flex-direction","justify-content","font-weight"]', 'justify-content', 'intermediate', 'web'),
('web-assess-i3', 'What does DOM stand for?', 'DOM ምን ማለት ነው?', '["Digital Object Manager","Document Object Model","Data Object Mapping","Direct Output Mode"]', 'Document Object Model', 'intermediate', 'web'),
('web-assess-i4', 'Which HTTP method is most often used to fetch a resource without side effects?', 'ጎንዮሽ ውጤት ሳይኖር ምንጭ ለማምጣት የሚያገለግለው የ HTTP ዘዴ የትኛው ነው?', '["POST","DELETE","GET","PATCH"]', 'GET', 'intermediate', 'web'),
('web-assess-i5', 'What is a media query in CSS used for?', 'በ CSS ውስጥ media query ለምን ይጠቀማል?', '["Playing audio files","Applying styles based on conditions like viewport width","Connecting to SQL","Minifying JavaScript"]', 'Applying styles based on conditions like viewport width', 'intermediate', 'web'),

('web-assess-a1', 'What is event bubbling in the DOM?', 'በ DOM ውስጥ የክስተት bubbling ምንድን ነው?', '["Events are discarded","Events propagate from the target element up to ancestors","Events only fire on the document root","Events compile to C++"]', 'Events propagate from the target element up to ancestors', 'advanced', 'web'),
('web-assess-a2', 'What does Promise.all do?', 'Promise.all ምን ያደርጋል?', '["Deletes all promises","Waits for all input promises and rejects if any reject","Runs promises on the GPU","Encrypts async code"]', 'Waits for all input promises and rejects if any reject', 'advanced', 'web'),
('web-assess-a3', 'In CSS Grid, what is the fr unit?', 'በ CSS Grid ውስጥ fr አሃዝ ምንድን ነው?', '["Fixed to 1px","A fraction of the free space in the grid container","Frames per second","Font ratio"]', 'A fraction of the free space in the grid container', 'advanced', 'web'),
('web-assess-a4', 'What is a closure in JavaScript?', 'በ JavaScript ውስጥ closure ምንድን ነው?', '["A deleted variable","A function that remembers variables from its outer scope","A browser tab","A CSS pseudo-class"]', 'A function that remembers variables from its outer scope', 'advanced', 'web'),
('web-assess-a5', 'What does REST commonly emphasize for web APIs?', 'REST ለ ድር APIዎች በተለምዶ ምን ያጎላል?', '["Stateful sessions on the server","Stateless communication using standard HTTP methods","Only binary protocols","Running only in WebAssembly"]', 'Stateless communication using standard HTTP methods', 'advanced', 'web');
