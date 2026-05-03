const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({ margin: 50 });
doc.pipe(fs.createWriteStream('public/Resume_Salman_Hussain_Sakib.pdf'));

// Fonts and Colors
const primaryColor = '#4f46e5'; // Indigo-600
const textColor = '#333333';
const mutedColor = '#666666';

// Header
doc.fontSize(28).fillColor(primaryColor).text('Salman Hussain Sakib', { align: 'center' });
doc.moveDown(0.2);
doc.fontSize(14).fillColor(textColor).text('Full Stack Developer', { align: 'center' });
doc.moveDown(0.2);
doc.fontSize(10).fillColor(mutedColor).text('Sylhet, Bangladesh | +880 1700963008 | sakibsalmanh@gmail.com', { align: 'center' });
doc.text('LinkedIn: linkedin.com/in/salmanhussainsakib | GitHub: github.com/salman-hussain-sakib', { align: 'center' });
doc.moveDown(1.5);

// Draw a line
doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke(primaryColor);
doc.moveDown(1);

// Helper for section titles
function addSection(title) {
  doc.fontSize(16).fillColor(primaryColor).text(title);
  doc.moveDown(0.3);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#e5e7eb').stroke();
  doc.moveDown(0.5);
}

// Professional Summary
addSection('Professional Summary');
doc.fontSize(11).fillColor(textColor).text(
  'Passionate Full-Stack Developer with expertise in crafting elegant, user-centric digital experiences. Adept at turning complex ideas into reality through clean, efficient code and creative design. Specialized in modern web technologies including React, Next.js, and Node.js.',
  { align: 'justify', lineGap: 3 }
);
doc.moveDown(1.5);

// Technical Skills
addSection('Technical Skills');
doc.fontSize(11).fillColor(textColor);
doc.text('• Frontend: React, Next.js, HTML5, CSS3, JavaScript (ES6+), Tailwind CSS', { lineGap: 3 });
doc.text('• Backend: Node.js, Express, MongoDB', { lineGap: 3 });
doc.text('• Tools & Others: Git, GitHub API, Responsive Design, UI/UX Principles', { lineGap: 3 });
doc.moveDown(1.5);

// Featured Projects
addSection('Featured Projects');
const projects = [
  { name: 'KeenKeeper - Productivity Application', stack: 'React, Next.js, Tailwind CSS', desc: 'A modern productivity application for managing tasks and notes with an intuitive, clean interface designed for optimal workflow.' },
  { name: 'DigiTools - Developer Utilities', stack: 'JavaScript, React, CSS3', desc: 'A comprehensive collection of digital utility tools and calculators built for developers and designers to speed up their daily tasks.' },
  { name: 'TechWave - E-Commerce Platform', stack: 'React, Node.js, MongoDB', desc: 'A modern e-commerce platform specifically designed for tech gadgets, featuring a sleek user interface and robust shopping cart functionality.' },
  { name: 'GitHub Issues Tracker - Developer Tool', stack: 'React, GitHub API, Tailwind CSS', desc: 'A specialized developer tool to track, manage, and analyze GitHub repository issues directly from a customized dashboard.' },
  { name: 'Architects - Portfolio Website', stack: 'HTML5, CSS3, JavaScript', desc: 'A stunning portfolio website designed for architectural firms, showcasing structural projects with high-quality visual layouts.' }
];

projects.forEach(p => {
  doc.fontSize(12).fillColor(textColor).font('Helvetica-Bold').text(p.name, { continued: true });
  doc.font('Helvetica-Oblique').fillColor(mutedColor).fontSize(10).text('   |   ' + p.stack);
  doc.font('Helvetica').fontSize(11).fillColor(textColor).text(p.desc, { lineGap: 2 });
  doc.moveDown(0.8);
});

// Education
doc.moveDown(0.5);
addSection('Education');
doc.fontSize(11).fillColor(textColor).font('Helvetica-Bold').text('Bachelor\'s Degree (or equivalent experience)');
doc.font('Helvetica').text('Focus on Computer Science and Software Engineering.');
doc.moveDown(1.5);

// Languages
addSection('Languages');
doc.fontSize(11).fillColor(textColor).text('• Bengali (Native)', { lineGap: 3 });
doc.text('• English (Professional Working Proficiency)', { lineGap: 3 });

doc.end();
console.log('PDF generated successfully!');
