import { GraduationCap, BookOpen, Users, Mail } from 'lucide-react';

export function AcademicFooter() {
  return (
    <footer className="bg-foreground text-background py-12 mt-16">
      <div className="section-container">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
              <GraduationCap className="w-6 h-6" />
              Academic Project
            </h3>
            <div className="space-y-2 text-background/80">
              <p><strong>Title:</strong> Predictive Modelling of Population Growth Using Recurrence Relations</p>
              <p><strong>Course:</strong> Discrete Mathematics</p>
              <p><strong>Academic Year:</strong> 2024-2025</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
              <Users className="w-6 h-6" />
              Project Team
            </h3>
            <div className="space-y-2 text-background/80">
              <p><strong>Student:</strong> [Student Name]</p>
              <p><strong>Guide:</strong> [Faculty Guide Name]</p>
              <p><strong>Department:</strong> Computer Science & Engineering</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-background/20 text-center text-background/60 text-sm">
          <p>
            This project demonstrates the application of AI-assisted logistic recurrence relations 
            for population growth prediction as part of Discrete Mathematics curriculum.
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} Academic Project. Built for educational purposes.
          </p>
        </div>
      </div>
    </footer>
  );
}
