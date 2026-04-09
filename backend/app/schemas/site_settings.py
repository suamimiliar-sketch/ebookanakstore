from pydantic import BaseModel, ConfigDict


class SiteSettingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    key: str
    value: dict


class SiteSettingUpdate(BaseModel):
    value: dict
