package com.compahunt.mapper

import com.compahunt.dto.*
import com.compahunt.model.*
import org.mapstruct.*

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
interface UserProfileMapper {

//    @Mapping(target = "skills", source = "skills")
    @Mapping(target = "workExperiences", source = "workExperiences")
//    @Mapping(target = "careerGoals", source = "careerGoals")
//    @Mapping(target = "preferences", source = "preferences")
    fun toUserProfileResponse(userProfile: UserProfile): UserProfileResponse

//    @Mapping(target = "id", ignore = true)
//    @Mapping(target = "userProfile", expression = "java(userProfile)")
//    fun toUserSkill(skillRequest: UserSkillRequest, userProfile: UserProfile): UserSkill

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userProfile", expression = "java(userProfile)")
    fun toWorkExperience(expRequest: WorkExperienceRequest, userProfile: UserProfile): WorkExperience

//    @Mapping(target = "id", ignore = true)
//    @Mapping(target = "userProfile", expression = "java(userProfile)")
//    fun toCareerGoal(goalRequest: CareerGoalRequest, userProfile: UserProfile): CareerGoal

//    @Mapping(target = "id", ignore = true)
//    @Mapping(target = "userProfile", expression = "java(userProfile)")
//    fun toUserPreference(prefRequest: UserPreferenceRequest, userProfile: UserProfile): UserPreference

}