import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Car, Wrench, Phone } from "lucide-react";
import { Card } from "../ui/card";

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface HowItWorksProps {
  steps?: Step[];
}

const defaultSteps: Step[] = [
  {
    icon: <Car className="w-8 h-8 text-primary" />,
    title: "Request Assistance",
    description:
      "Use our simple form to describe your vehicle issue and location",
  },
  {
    icon: <Wrench className="w-8 h-8 text-primary" />,
    title: "Get Matched",
    description: "We'll connect you with a qualified mechanic in your area",
  },
  {
    icon: <Phone className="w-8 h-8 text-primary" />,
    title: "Receive Help",
    description:
      "Your mechanic will arrive quickly to get you back on the road",
  },
];

const HowItWorks: React.FC<HowItWorksProps> = ({ steps = defaultSteps }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <section className="w-full min-h-[600px] bg-background py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="space-y-12"
        >
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get back on the road quickly with our simple three-step process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="p-6 h-full flex flex-col items-center text-center space-y-4 hover:shadow-lg transition-shadow">
                  <div className="p-3 bg-primary/10 rounded-full">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
                      <ArrowRight className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
