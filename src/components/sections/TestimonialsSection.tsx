import React from "react";
import { Card } from "../ui/card";
import { Avatar } from "../ui/avatar";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  service: string;
}

interface TestimonialsSectionProps {
  testimonials?: Testimonial[];
}

const defaultTestimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    rating: 5,
    text: "ResQ Auto saved me when I was stranded on the highway. The mechanic arrived within 15 minutes!",
    service: "Emergency Roadside Assistance",
  },
  {
    id: "2",
    name: "Michael Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
    rating: 5,
    text: "Incredible service! The app made it so easy to find help when my car broke down.",
    service: "Battery Replacement",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily",
    rating: 4,
    text: "Professional and quick service. The mechanic was very knowledgeable and friendly.",
    service: "Flat Tire Repair",
  },
];

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 h-full bg-white shadow-lg">
        <div className="flex items-center mb-4">
          <Avatar className="h-12 w-12">
            <img
              src={testimonial.avatar}
              alt={testimonial.name}
              className="rounded-full"
            />
          </Avatar>
          <div className="ml-4">
            <h3 className="font-semibold text-lg">{testimonial.name}</h3>
            <p className="text-sm text-gray-500">{testimonial.service}</p>
          </div>
        </div>
        <div className="flex mb-2">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
          ))}
        </div>
        <p className="text-gray-700">{testimonial.text}</p>
      </Card>
    </motion.div>
  );
};

const TestimonialsSection = ({
  testimonials = defaultTestimonials,
}: TestimonialsSectionProps) => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Don&apos;t just take our word for it - hear from some of our
            satisfied customers about their experience with ResQ Auto.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
