import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  FileText, 
  Calendar,
  Award,
  Target,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';

const SkillGroup = ({ title, skills }) => (
  <motion.div 
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className="mb-4"
  >
    <h6 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
      <Target className="h-4 w-4" />
      {title}
    </h6>
    <div className="flex flex-wrap gap-2">
      {(skills || []).map((skill, index) => (
        <Badge 
          key={index} 
          variant="secondary" 
          className="bg-gray-700 text-gray-200 hover:bg-gray-600"
        >
          {skill}
        </Badge>
      ))}
    </div>
  </motion.div>
);

const ResultBox = ({ result }) => {
  if (!result) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gray-900/80 border border-blue-800 rounded-2xl shadow-2xl">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl font-bold text-blue-300 flex items-center gap-3">
            <TrendingUp className="h-6 w-6" />
            Skill Match Report
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Score Section */}
          <div className="bg-blue-950/30 rounded-lg p-4 border border-blue-700">
            <div className="flex items-center justify-between">
              <span className="text-blue-200 font-semibold">Overall Score</span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {result.score ?? 'N/A'}%
                </span>
              </div>
            </div>
          </div>

          <Separator className="bg-blue-800" />

          {/* Matched Skills */}
          <div className="space-y-3">
            <h6 className="text-lg font-semibold text-green-400 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Matched Skills
            </h6>
            {result.matchedSkills?.length || result.matched_skills?.length ? (
              <div className="flex flex-wrap gap-2">
                {(result.matchedSkills || result.matched_skills).map((skill, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Badge className="bg-green-600 text-white hover:bg-green-700">
                      {skill}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">No matched skills found</p>
            )}
          </div>

          <Separator className="bg-blue-800" />

          {/* Missing Skills */}
          <div className="space-y-3">
            <h6 className="text-lg font-semibold text-red-400 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Missing Skills
            </h6>
            {result.missingSkills?.length || result.missing_skills?.length ? (
              <div className="flex flex-wrap gap-2">
                {(result.missingSkills || result.missing_skills).map((skill, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Badge className="bg-red-600 text-white hover:bg-red-700">
                      {skill}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">No missing skills</p>
            )}
          </div>

          <Separator className="bg-blue-800" />

          {/* Grouped Resume Skills */}
          <div className="space-y-4">
            <h5 className="text-xl font-bold text-blue-300 flex items-center gap-2">
              <Award className="h-5 w-5" />
              Grouped Resume Skills
            </h5>
            {result.groupedResumeSkills || result.grouped_resume_skills
              ? Object.entries(result.groupedResumeSkills || result.grouped_resume_skills).map(([section, groups], index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                >
                  <h6 className="text-blue-400 font-semibold mb-3 text-lg">{section}</h6>
                  {groups && Object.entries(groups).map(([groupName, skills], i) => (
                    <SkillGroup key={i} title={groupName} skills={skills} />
                  ))}
                </motion.div>
              ))
              : <p className="text-gray-400 italic">No grouped skills available</p>
            }
          </div>

          {/* Feedback Section */}
          {(result.feedback || result.feedback) && (
            <>
              <Separator className="bg-blue-800" />
              <div className="space-y-3">
                <h6 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  AI Feedback
                </h6>
                <div className="bg-cyan-950/30 rounded-lg p-4 border border-cyan-700">
                  <p className="text-cyan-200 leading-relaxed">{result.feedback}</p>
                </div>
              </div>
            </>
          )}

          {/* Resume Meta Information */}
          {(result.resumeMeta || result.resume_meta) && (
            <>
              <Separator className="bg-blue-800" />
              <div className="space-y-3">
                <h6 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Resume Information
                </h6>
                <div className="bg-purple-950/30 rounded-lg p-4 border border-purple-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200 font-medium">Filename:</span>
                    <span className="text-purple-300">{(result.resumeMeta?.filename || result.resume_meta?.filename) ?? 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200 font-medium">Uploaded At:</span>
                    <span className="text-purple-300 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {result.resumeMeta?.uploadedAt ? new Date(result.resumeMeta.uploadedAt).toLocaleString() : (result.resume_meta?.uploadedAt ? new Date(result.resume_meta.uploadedAt).toLocaleString() : 'N/A')}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ResultBox;
