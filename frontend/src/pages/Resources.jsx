import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/accordion';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { BookOpen, Youtube } from 'lucide-react';

const Resources = () => {
  const [jds, setJds] = useState([]);
  const [selectedJd, setSelectedJd] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5001/api/jds', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    })
    .then(res => {
      setJds(res.data);
    })
    .catch(err => {
      console.error('Error fetching JDs:', err);
    });
  }, []);

  const handleJdSelect = (id) => {
    const jd = jds.find(j => j._id === id);
    setSelectedJd(jd);
  };

  const resources = selectedJd?.resources || {};

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 mt-16 bg-gradient-to-br from-black via-gray-900 to-blue-950 min-h-screen rounded-3xl shadow-2xl">
      <h2 className="text-center mb-10 text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
        Learning Resources
      </h2>
      <section className="mb-10 flex flex-col items-center">
        {jds.length === 0 ? (
          <div className="text-gray-400 text-lg">No job descriptions found. Upload a JD to get started!</div>
        ) : (
          <>
              <label className="font-semibold mb-2 text-blue-200 text-lg">Select a Job Description:</label>
              <div className="w-80">
                <Select onValueChange={handleJdSelect} value={selectedJd ? selectedJd._id : ''}>
                  <SelectTrigger className="w-full bg-gray-900 border-blue-700 text-blue-200 focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="-- Select JD --" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-blue-700 text-blue-200">
                    {jds.map(jd => (
                      <SelectItem key={jd._id} value={jd._id} className="hover:bg-blue-800/40">
                        {jd.title || jd.jdText.slice(0, 40)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
          </>
        )}
      </section>
      <AnimatePresence>
        {selectedJd && (
          <motion.section
            key="skills-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.5 }}
            className="mb-10 bg-gray-900/70 rounded-xl p-6 shadow-lg border border-blue-800 max-w-2xl mx-auto"
          >
            <strong className="text-blue-300 text-lg">Skills for this JD:</strong>
            <ul className="flex flex-wrap gap-3 mt-2">
              {(selectedJd.skills || []).map(skill => (
                <li key={skill}>
                  <Badge className="bg-blue-700 text-white text-base font-semibold px-4 py-2 rounded-lg shadow-md">
                    {skill}
                  </Badge>
                </li>
              ))}
            </ul>
          </motion.section>
        )}
      </AnimatePresence>
      <section className="mb-6">
        <h3 className="text-blue-200 font-extrabold text-2xl mb-6 tracking-wide text-center">Skill-wise Curated Resources</h3>
        <div className="flex flex-wrap gap-8 justify-center">
          <AnimatePresence>
            {Object.entries(resources).map(([skill, { articles, videos }], idx) => (
              <motion.div
                key={skill}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="flex-1 min-w-[320px] max-w-sm mb-7"
              >
                <Card className="bg-gray-900/80 border border-blue-800 rounded-2xl shadow-xl h-full flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-blue-400 text-xl font-bold flex items-center gap-2">
                      {skill}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4 flex-1">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="articles">
                        <AccordionTrigger className="text-blue-200 font-semibold flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-blue-400" /> Articles
                        </AccordionTrigger>
                        <AccordionContent>
                          {(!articles || articles.length === 0) ? (
                            <div className="text-gray-400 italic mt-1">No articles found for this skill.</div>
                          ) : (
                              <ul className="pl-3 mt-1 space-y-2">
                                {(articles || []).map((a, i) => (
                                  <motion.li key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
                                    <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline font-medium text-base hover:text-blue-300 transition-colors duration-150">
                                      {a.title}
                                    </a>
                                  </motion.li>
                                ))}
                            </ul>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="videos">
                        <AccordionTrigger className="text-blue-200 font-semibold flex items-center gap-2">
                          <Youtube className="h-5 w-5 text-red-500" /> Videos
                        </AccordionTrigger>
                        <AccordionContent>
                          {(!videos || videos.length === 0) ? (
                            <div className="text-gray-400 italic mt-1">No YouTube videos found for this skill.</div>
                          ) : (
                              <div className="flex flex-col gap-3 mt-2">
                                <AnimatePresence>
                                  {(videos || []).map((v, i) => (
                                    <motion.a
                                      key={i}
                                      href={v.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      initial={{ opacity: 0, x: 30 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: 30 }}
                                      transition={{ delay: 0.15 + i * 0.07 }}
                                      className="flex items-center gap-3 bg-blue-950/40 rounded-lg px-2 py-2 hover:bg-blue-900/60 transition-colors duration-150 shadow"
                                    >
                                      <img src={v.thumbnail} alt={v.title} width={80} height={48} className="rounded-md border border-blue-700 object-cover bg-blue-950" />
                                      <span className="text-blue-200 font-semibold text-base line-clamp-2">{v.title}</span>
                                    </motion.a>
                                  ))}
                              </AnimatePresence>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          {selectedJd && Object.keys(resources).length === 0 && <div className="text-gray-400 italic mt-6">No resources found for this JD's skills.</div>}
        </div>
      </section>
    </div>
  );
};

export default Resources; 