import { useState } from 'react';
import { Menu, X, Calculator, TrendingUp } from 'lucide-react';

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'introduction', label: 'Introduction' },
  { id: 'theory', label: 'Theory' },
  { id: 'data-input', label: 'Data Input' },
  { id: 'prediction', label: 'Prediction' },
  { id: 'results', label: 'Results' },
  { id: 'simulator', label: 'Simulator' },
  { id: 'applications', label: 'Applications' },
  { id: 'conclusion', label: 'Conclusion' },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  return (
    <nav className="nav-sticky">
      <div className="section-container py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-serif font-bold text-foreground leading-tight">
                Population Growth
              </h1>
              <p className="text-xs text-muted-foreground">Predictive Modelling</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="nav-link px-3 py-2 rounded-md hover:bg-muted transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden mt-4 py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="nav-link px-4 py-2 text-left rounded-md hover:bg-muted transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
