"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const testimonials = [
  {
    name: "George",
    avatar: "G",
    title: "Software Engineer",
    description: "This is the one of the best free content generation tool I've ever used!"
  },
  {
    name: "Tim",
    avatar: "T",
    title: "QA Engineer",
    description: "Code generation part of it is just amazing!"
  },
  {
    name: "Mark",
    avatar: "M",
    title: "Music Producer",
    description: "I use it for my daily work, as it generates exceptional music content!"
  },
  {
    name: "Antonio",
    avatar: "A",
    title: "Lead RUST Developer",
    description: "No words for how effective it is & it basically brings everything at one place."
  },
]

export const LandingContent = () => {
  return (
    <div className="px-10 pb-20">
      <h2 className="text-center text-4xl text-white font-extrabold mb-10">Testimonials</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {testimonials.map((item) => (
          <Card key={item.description} className="bg-[#192339] border-none text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-x-2">
                <div>
                  <p className="text-lg ">{item.name}</p>
                  <p className="text-zinc-400 text-sm">{item.title}</p>
                </div>
              </CardTitle>
              <CardContent className="pt-4 px-0">{item.description}</CardContent>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LandingContent;
