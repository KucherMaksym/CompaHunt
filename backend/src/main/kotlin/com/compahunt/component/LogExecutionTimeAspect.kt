package com.compahunt.component

import org.aspectj.lang.ProceedingJoinPoint
import org.aspectj.lang.annotation.Around
import org.aspectj.lang.annotation.Aspect
import org.springframework.stereotype.Component
import com.compahunt.annotation.LogExecutionTime

@Aspect
@Component
class LogExecutionTimeAspect() {

    @Around("@annotation(com.compahunt.annotation.LogExecutionTime)")
    fun logExecutionTime(joinPoint: ProceedingJoinPoint): Any {
        val startTime = System.currentTimeMillis();
        val result = joinPoint.proceed();
        val elapedTime =  System.currentTimeMillis() - startTime;

        println("${joinPoint.signature} executed in ${elapedTime}ms")

        return result;
    }
}