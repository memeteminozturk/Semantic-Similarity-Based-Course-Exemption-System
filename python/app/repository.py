import json
import pathlib
from typing import Dict, Optional

import motor.motor_asyncio as motor


class CourseRepository:
    def __init__(
        self, src: str | None = "internal_courses.json", mongo_uri: str | None = None
    ):
        self._cache: Dict[str, str] = {}
        if mongo_uri:
            self._mongo = motor.AsyncIOMotorClient(mongo_uri)["db"]["courses"]
        else:
            self._mongo = None
            self._path = pathlib.Path(src)

    async def load(self):
        if self._mongo:
            async for d in self._mongo.find({}, {"_id": 0, "code": 1, "content": 1}):
                self._cache[d["code"]] = d["content"]
        else:
            self._cache = {
                d["code"]: d.get("content", "")
                for d in json.loads(self._path.read_text(encoding="utf-8"))
            }

    def get(self, code: str) -> Optional[str]:
        return self._cache.get(code)
