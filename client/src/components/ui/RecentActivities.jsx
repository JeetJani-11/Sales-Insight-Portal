"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Avatar, AvatarImage } from "./avatar";
import { CheckCircle, LoaderCircleIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";

export default function RecentActivities() {
  const recentActivities = useSelector((state) => state.recentActivities);
  return (
    <div className="lg:col-span-3">
      <Card className="bg-white  rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-medium text-black">
            <motion.span
              className="h-2 w-2 rounded-full bg-gradient-to-r from-pink-400 to-orange-400"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            Recent Updates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentActivities ? (
            recentActivities.map((update, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-3 group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <CheckCircle className="h-5 w-5 mt-1 text-gray-700" />
                </motion.div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm text-gray-900 transition-colors duration-200">
                    {update.update}
                  </p>
                  <div className="flex flex-row items-center">
                    <motion.div
                      className="flex -space-x-2"
                      whileHover={{ scale: 1.1 }}
                    >
                      {update.source === 1 ? (
                        <>
                          <Avatar className="h-4 w-4 mr-4">
                            <AvatarImage
                              src="https://upload.wikimedia.org/wikipedia/commons/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg"
                              alt="Teams icon"
                            />
                          </Avatar>
                          <p className="text-xs text-gray-500">Teams{"  "}</p>
                        </>
                      ) : (
                        <>
                          <Avatar className="h-4 w-4 mr-4">
                            <AvatarImage
                              src="https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg"
                              alt="Outlook icon"
                            />
                          </Avatar>
                          <p className="text-xs text-gray-500">Outlook</p>
                        </>
                      )}
                    </motion.div>
                    <p className="text-xs text-gray-400 ml-2">•</p>
                    <p className="text-xs text-gray-500 ml-2 mt-0">{update.date}</p>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <CardContent className="flex items-center justify-center h-32">
              <LoaderCircleIcon className="text-black animate-spin" />
            </CardContent>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
